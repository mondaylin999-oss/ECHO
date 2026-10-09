import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { config } from "./config";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { createRateLimiter } from "./middleware/rateLimiter";
import { createApiRouter } from "./routes";
import type { Content } from "./services/contentStore";

export interface AppOptions {
  corsOrigins?: string[];
  publicDir?: string;
  rateLimit?: { windowMs: number; max: number };
}

export function createApp(content: Content, options: AppOptions = {}): Express {
  const app = express();
  app.disable("x-powered-by");
  // On Vercel every request arrives through one proxy; trust it so rate limiting sees the client IP.
  if (process.env.VERCEL) app.set("trust proxy", 1);

  // Images are loaded by a front-end on another origin, so they must be embeddable cross-origin.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: options.corsOrigins ?? config.corsOrigins, methods: ["GET", "POST"] }));
  app.use(express.json({ limit: "10kb" }));

  // public/images/... is served at /images/...
  app.use(express.static(options.publicDir ?? config.publicDir, { index: false }));

  app.use("/api", createRateLimiter(options.rateLimit ?? config.rateLimit), createApiRouter(content));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
