import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import seoRouter from "./seoRouter";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { csrfProtectionMiddleware, generateCsrfToken } from "./csrf";
import { getUserSchemaStatus } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Optional: auto-run migrations at startup
  if (process.env.AUTO_MIGRATE === "true") {
    try {
      const { runMigrations } = await import("./migrate");
      await runMigrations();
    } catch (error) {
      console.error("[Server] Database migrations failed at startup:", error);
    }
  }

  const app = express();
  const server = createServer(app);

  // Trust proxy for Render/production deployment
  app.set('trust proxy', true);

  // Middleware to disable/bypass rate limiting for testing
  app.use((req, res, next) => {
    // Remove rate limit headers that proxies might add
    res.removeHeader('X-RateLimit-Limit');
    res.removeHeader('X-RateLimit-Remaining');
    res.removeHeader('X-RateLimit-Reset');
    
    // Add headers to tell proxies to not rate limit
    res.setHeader('X-RateLimit-Override', 'true');
    res.setHeader('Cache-Control', 'no-cache');
    
    next();
  });

  // Plain health endpoint for infra checks (BEFORE all middleware)
  app.get("/health", (_req, res) => {
    res.json({ 
      ok: true, 
      service: "backend", 
      time: Date.now(),
    });
  });

  // ============================================
  // MIDDLEWARE ORDER CRITICAL FOR FUNCTIONALITY
  // ============================================
  
  // 1. CORS ALLOWED ORIGINS (used by CORS + CSP)
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

  const defaultOrigins = [
    "http://localhost:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5173",
  ];

  const resolvedAllowedOrigins =
    allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

  const hasWildcardOrigin = resolvedAllowedOrigins.includes("*");

  // 2. SECURITY: Helmet configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: (() => {
          const isDev = process.env.NODE_ENV === "development";
          const connectSrc = new Set<string>([
            "'self'",
            "*.googleapis.com",
          ]);

          const maybeAddOrigin = (value?: string) => {
            if (!value) return;
            const trimmed = value.trim();
            if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
              connectSrc.add(trimmed);
            }
          };

          if (isDev) {
            connectSrc.add("localhost:*");
          }

          // Add resolved allowed origins (frontend URLs that call API)
          for (const origin of resolvedAllowedOrigins) {
            maybeAddOrigin(origin);
          }

          // Add API URL if specified
          maybeAddOrigin(process.env.VITE_API_URL);
          
          // Add Frontend URL explicitly
          maybeAddOrigin(process.env.FRONTEND_URL);
          
          // Log CSP for debugging
          if (isDev) {
            console.log("[CSP] Allowed origins:", Array.from(connectSrc));
          }

          return {
            defaultSrc: ["'self'"],
            scriptSrc: isDev
              ? ["'self'", "'unsafe-inline'", "localhost:*"]
              : ["'self'"],
            styleSrc: isDev
              ? ["'self'", "'unsafe-inline'", "fonts.googleapis.com"]
              : ["'self'", "fonts.googleapis.com"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: Array.from(connectSrc),
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
          };
        })(),
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      noSniff: true,
      xssFilter: true,
      frameguard: { action: "deny" },
    })
  );

  // 3. CORS: MUST be before body parsers and auth middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (hasWildcardOrigin) return callback(null, true);
        if (resolvedAllowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("CORS not authorized"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
      optionsSuccessStatus: 200,
    })
  );

  // 3. BODY PARSERS
  app.use(cookieParser());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // 4. OAUTH ROUTES (public)
  registerOAuthRoutes(app);

  // 5. SEO ROUTES (public)
  app.use(seoRouter);

  // 6. SIMPLE HEALTH ENDPOINT FOR MONITORING (public, no CSRF needed)
  app.get("/api/health", (_req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      res.json({ ok: true, service: "backend", time: Date.now() });
    } catch (error) {
      console.error('[Health] Error:', error);
      res.status(500).setHeader('Content-Type', 'application/json').send('{"ok":false}');
    }
  });

  // 7. PUBLIC SCHEMA STATUS (no CSRF needed)
  app.get("/api/schema-status", async (_req, res) => {
    try {
      const status = await getUserSchemaStatus();
      res.setHeader('Content-Type', 'application/json');
      res.json({ ok: true, status });
    } catch (error) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ ok: false, error: String(error) });
    }
  });

  // 8. SEED ENDPOINT (public for setup only - REMOVE AFTER FIRST USE)
  app.post("/api/seed-settings", async (req, res) => {
    try {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ ok: false, error: "Database not available" });
      }

      // Import schema
      const { settings } = await import("../../drizzle/schema");

      // Check if already seeded
      const existing = await db.select().from(settings).limit(1);
      if (existing.length > 0) {
        return res.json({ ok: true, message: "Settings already exist", count: existing.length });
      }

      // Seed data
      const settingsData = [
        // Informações do Psicólogo
        { key: 'psychologist_name', value: 'Dr. [Nome do Psicólogo]', type: 'string' as const, description: 'Nome completo do psicólogo' },
        { key: 'psychologist_crp', value: 'CRP 06/123456', type: 'string' as const, description: 'Número do CRP' },
        { key: 'psychologist_phone', value: '(11) 99999-9999', type: 'string' as const, description: 'Telefone para contato' },
        { key: 'psychologist_email', value: 'contato@psicologo.com.br', type: 'string' as const, description: 'Email profissional' },
        
        // Endereço
        { key: 'office_address_street', value: 'Rua Exemplo, 123', type: 'string' as const, description: 'Endereço do consultório' },
        { key: 'office_address_complement', value: 'Sala 45', type: 'string' as const, description: 'Complemento' },
        { key: 'office_address_district', value: 'Jardim Paulista', type: 'string' as const, description: 'Bairro' },
        { key: 'office_address_city', value: 'São Paulo', type: 'string' as const, description: 'Cidade' },
        { key: 'office_address_state', value: 'SP', type: 'string' as const, description: 'Estado' },
        { key: 'office_address_zip', value: '01310-100', type: 'string' as const, description: 'CEP' },
        
        // Mapa
        { key: 'map_latitude', value: '-23.550520', type: 'string' as const, description: 'Latitude do consultório' },
        { key: 'map_longitude', value: '-46.633308', type: 'string' as const, description: 'Longitude do consultório' },
        { key: 'map_zoom', value: '15', type: 'number' as const, description: 'Zoom do mapa' },
        { key: 'map_enabled', value: 'true', type: 'boolean' as const, description: 'Exibir mapa no site' },
        
        // Redes Sociais
        { key: 'social_whatsapp', value: '5511999999999', type: 'string' as const, description: 'WhatsApp com DDI e DDD' },
        { key: 'whatsapp_enabled', value: 'true', type: 'boolean' as const, description: 'Exibir botão WhatsApp' },
        { key: 'whatsapp_default_message', value: 'Olá! Gostaria de saber mais sobre os atendimentos.', type: 'string' as const, description: 'Mensagem padrão' },
        
        // Valores e Horários
        { key: 'session_price_presential', value: 'R$ 200,00', type: 'string' as const, description: 'Valor sessão presencial' },
        { key: 'session_price_online', value: 'R$ 180,00', type: 'string' as const, description: 'Valor sessão online' },
        { key: 'session_duration', value: '60', type: 'number' as const, description: 'Duração em minutos' },
        { key: 'office_hours_weekdays', value: 'Segunda a Sexta: 8h às 18h', type: 'string' as const, description: 'Horários dias úteis' },
        
        // Features
        { key: 'feature_online_booking', value: 'true', type: 'boolean' as const, description: 'Agendamento online' },
        { key: 'feature_blog_comments', value: 'false', type: 'boolean' as const, description: 'Comentários no blog' },
        { key: 'google_analytics_enabled', value: 'false', type: 'boolean' as const, description: 'Google Analytics' },
      ];

      await db.insert(settings).values(settingsData);

      res.json({ ok: true, message: "Settings seeded successfully", count: settingsData.length });
    } catch (error: any) {
      console.error("[Seed] Error:", error);
      res.status(500).json({ ok: false, error: error.message });
    }
  });

  // 9. CSRF TOKEN ENDPOINT (public, no protection needed)
  app.get("/api/csrf-token", (req, res) => {
    try {
      // @ts-ignore - sessionID might exist if express-session is present, but we fallback
      const sessionId = req.sessionID || req.ip || "anonymous";
      const token = generateCsrfToken(sessionId, req.ip);
      res.setHeader('Content-Type', 'application/json');
      res.json({ token });
    } catch (error) {
      console.error('[CSRF Token] Error:', error);
      res.status(500).setHeader('Content-Type', 'application/json').json({ error: 'Failed to generate CSRF token' });
    }
  });

  // ============================================
  // 10. CSRF PROTECTION MIDDLEWARE (ONLY for tRPC)
  // ============================================
  app.use("/api/trpc", csrfProtectionMiddleware);

  // ============================================
  // 11. tRPC API HANDLER
  // ============================================
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Global error handler for API routes to ensure JSON response
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[API Error]", err);
    if (!res.headersSent) {
      // Return TRPC-compliant error envelope
      res.status(500).json({
        error: {
          message: err.message || "Internal Server Error",
          code: -32603, // INTERNAL_SERVER_ERROR
          data: {
            httpStatus: 500,
            code: "INTERNAL_SERVER_ERROR",
            path: req.path
          }
        }
      });
    }
  });

  // 12. 404 HANDLER FOR API ROUTES (must be after all API routes but before frontend)
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      error: {
        message: "API endpoint not found",
        code: -32004, // NOT_FOUND
        data: { httpStatus: 404, code: "NOT_FOUND", path: req.path }
      }
    });
  });

  // ============================================
  // 13. STATIC FILES & VITE (last, for SPA)
  // ============================================
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Inicializar scheduler de lembretes
    try {
      const { initializeScheduler, startDailyReminderCheck } = await import("./scheduler");
      await initializeScheduler();
      startDailyReminderCheck();
      console.log("✅ Reminder scheduler initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize scheduler:", error);
    }
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully...");
    const { stopAllReminders } = await import("./scheduler");
    stopAllReminders();
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
}

startServer().catch(console.error);
