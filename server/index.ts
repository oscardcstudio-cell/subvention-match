import * as Sentry from "@sentry/node";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// --- Sentry (error tracking) ---
// Crée un projet Node.js sur https://sentry.io, copie le DSN et ajoute-le
// dans Railway : SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    tracesSampleRate: 0.2, // 20% des requêtes tracées (suffisant pour une beta)
  });
  log("Sentry initialized");
}

const app = express();
// Railway (et tout reverse proxy) envoie X-Forwarded-For.
// Sans ça, express-rate-limit voit toutes les requêtes comme venant de la même IP.
app.set("trust proxy", 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Envoie l'erreur à Sentry si configuré
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err);
    }

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // reusePort:true is a Linux-only SO_REUSEPORT optimization for multi-process
  // servers. We're single-process and Railway sometimes rejects deploys that
  // use it — removed for portability.
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
    
    // Démarrer le scheduler de rafraîchissement automatique (toutes les semaines)
    import('./auto-refresh-scheduler').then(({ autoRefreshScheduler }) => {
      autoRefreshScheduler.startAutoRefresh(7); // 7 jours
    }).catch(err => {
      console.error('Erreur démarrage scheduler:', err.message);
    });
  });
})();
