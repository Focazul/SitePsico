import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import seoRouter from "./seoRouter";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { csrfProtectionMiddleware } from "./csrf";
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

  // Trust proxy for Railway/production deployment
  app.set('trust proxy', true);

  // Middleware to disable/bypass rate limiting for testing
  app.use((req, res, next) => {
    // Remove rate limit headers that Railway might add
    res.removeHeader('X-RateLimit-Limit');
    res.removeHeader('X-RateLimit-Remaining');
    res.removeHeader('X-RateLimit-Reset');
    
    // Add headers to tell proxies to not rate limit
    res.setHeader('X-RateLimit-Override', 'true');
    res.setHeader('Cache-Control', 'no-cache');
    
    next();
  });

  // Plain health endpoint for infra checks
  app.get("/health", (_req, res) => {
    res.json({ 
      ok: true, 
      service: "backend", 
      time: Date.now(),
      devSkipAuth: process.env.DEV_SKIP_AUTH === 'true',
      csrfBypass: process.env.DEV_SKIP_AUTH === 'true'
    });
  });

  // Security: Helmet configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: (() => {
          const isDev = process.env.NODE_ENV === "development";
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
            connectSrc: isDev
              ? ["'self'", "localhost:*", "*.googleapis.com"]
              : ["'self'", "*.googleapis.com"],
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

  // CORS configuration
  const allowedOrigins = 
    process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:5174",
      "http://localhost:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5173",
    ];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
      optionsSuccessStatus: 200,
    })
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // SEO routes (sitemap.xml, robots.txt)
  app.use(seoRouter);

  // CSRF token endpoint (before CSRF middleware)
  app.get("/api/csrf-token", (req, res) => {
    const { generateCsrfToken } = require("./csrf");
    const sessionId = req.sessionID || req.ip || "anonymous";
    const token = generateCsrfToken(sessionId, req.ip);
    res.json({ token });
  });

  // Simple health endpoint for monitoring (no CSRF needed)
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "backend", time: Date.now() });
  });

  // Public schema status (GET) for quick production verification (no CSRF needed)
  app.get("/api/schema-status", async (_req, res) => {
    try {
      const status = await getUserSchemaStatus();
      res.json({ ok: true, status });
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error) });
    }
  });

  // Temporary seed endpoint (REMOVE AFTER FIRST USE)
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
        { key: 'psychologist_name', value: 'Dr. [Nome do Psicólogo]', type: 'string', description: 'Nome completo do psicólogo' },
        { key: 'psychologist_crp', value: 'CRP 06/123456', type: 'string', description: 'Número do CRP' },
        { key: 'psychologist_phone', value: '(11) 99999-9999', type: 'string', description: 'Telefone para contato' },
        { key: 'psychologist_email', value: 'contato@psicologo.com.br', type: 'string', description: 'Email profissional' },
        
        // Endereço
        { key: 'office_address_street', value: 'Rua Exemplo, 123', type: 'string', description: 'Endereço do consultório' },
        { key: 'office_address_complement', value: 'Sala 45', type: 'string', description: 'Complemento' },
        { key: 'office_address_district', value: 'Jardim Paulista', type: 'string', description: 'Bairro' },
        { key: 'office_address_city', value: 'São Paulo', type: 'string', description: 'Cidade' },
        { key: 'office_address_state', value: 'SP', type: 'string', description: 'Estado' },
        { key: 'office_address_zip', value: '01310-100', type: 'string', description: 'CEP' },
        
        // Mapa
        { key: 'map_latitude', value: '-23.550520', type: 'string', description: 'Latitude do consultório' },
        { key: 'map_longitude', value: '-46.633308', type: 'string', description: 'Longitude do consultório' },
        { key: 'map_zoom', value: '15', type: 'number', description: 'Zoom do mapa' },
        { key: 'map_enabled', value: 'true', type: 'boolean', description: 'Exibir mapa no site' },
        
        // Redes Sociais
        { key: 'social_whatsapp', value: '5511999999999', type: 'string', description: 'WhatsApp com DDI e DDD' },
        { key: 'whatsapp_enabled', value: 'true', type: 'boolean', description: 'Exibir botão WhatsApp' },
        { key: 'whatsapp_default_message', value: 'Olá! Gostaria de saber mais sobre os atendimentos.', type: 'string', description: 'Mensagem padrão' },
        
        // Valores e Horários
        { key: 'session_price_presential', value: 'R$ 200,00', type: 'string', description: 'Valor sessão presencial' },
        { key: 'session_price_online', value: 'R$ 180,00', type: 'string', description: 'Valor sessão online' },
        { key: 'session_duration', value: '60', type: 'number', description: 'Duração em minutos' },
        { key: 'office_hours_weekdays', value: 'Segunda a Sexta: 8h às 18h', type: 'string', description: 'Horários dias úteis' },
        
        // Features
        { key: 'feature_online_booking', value: 'true', type: 'boolean', description: 'Agendamento online' },
        { key: 'feature_blog_comments', value: 'false', type: 'boolean', description: 'Comentários no blog' },
        { key: 'google_analytics_enabled', value: 'false', type: 'boolean', description: 'Google Analytics' },
      ];

      await db.insert(settings).values(settingsData);

      res.json({ ok: true, message: "Settings seeded successfully", count: settingsData.length });
    } catch (error: any) {
      console.error("[Seed] Error:", error);
      res.status(500).json({ ok: false, error: error.message });
    }
  });

  // CSRF protection specifically for tRPC mutations (must be BEFORE tRPC handler)
  app.use("/api/trpc", csrfProtectionMiddleware);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

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
