import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http"; // Keep createServer for the dummy server

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  await registerRoutes(app); // Register routes directly on the app instance

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Importantly, only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes.
  // Vite will handle the server listening in development.
  if (app.get("env") === "development") {
    // Create a minimal dummy server instance just for Vite's HMR
    const dummyServer = createServer(app);
    await setupVite(app, dummyServer);
    // Vite's dev server will handle the listen call internally
  } else {
    // In production, serve static files (handled by serveStatic)
    serveStatic(app);
    // In production, we still need to listen, but this will be handled by the WebContainer entrypoint
    // or a separate process if deployed elsewhere. We remove the explicit listen here.
  }

  // Removed the explicit server.listen call entirely.
  // In development, Vite handles listening.
  // In production, the environment or deployment process handles listening.

})();
