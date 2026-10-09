import "dotenv/config";
import path from "node:path";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

// src/ in development and dist/ after a build both sit one level below the project root.
const rootDir = path.resolve(__dirname, "..");

export const config = {
  port: parsed.data.PORT,
  corsOrigins: parsed.data.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  dataDir: path.join(rootDir, "data"),
  publicDir: path.join(rootDir, "public"),
  rateLimit: { windowMs: 15 * 60 * 1000, max: 100 },
};
