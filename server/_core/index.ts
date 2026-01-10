import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
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

  // Rate Limiting
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "development", // Desabilita em dev
  });

  const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 tentativas
    message: "Muitas tentativas de reset. Tente novamente em 1 hora.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "development",
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Aplicar rate limiting nas rotas de autenticação
  app.post("/api/trpc/auth.login", loginLimiter);
  app.post("/api/trpc/auth.requestPasswordReset", passwordResetLimiter);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // SEO routes (sitemap.xml, robots.txt)
  app.use(seoRouter);

  // CSRF protection for API mutations
  app.use("/api", csrfProtectionMiddleware);

  // Public schema status (GET) for quick production verification
  app.get("/api/schema-status", async (_req, res) => {
    try {
      const status = await getUserSchemaStatus();
      res.json({ ok: true, status });
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error) });
    }
  });

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
