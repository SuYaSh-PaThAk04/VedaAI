import "dotenv/config";
import { z } from "zod";
import { parseCorsOrigins } from "./cors.js";

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  /** Comma-separated allowed browser origins (e.g. production + localhost). */
  WEB_URL: z.string().min(1).default("http://localhost:3000"),
  /** Optional extra origins appended to WEB_URL. */
  CORS_ORIGINS: z.string().optional(),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/vedaai"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  MOCK_AI: booleanFromEnv.default(false)
});

const parsed = envSchema.parse(process.env);

export const env = parsed;
export const corsOrigins = parseCorsOrigins(parsed.WEB_URL, parsed.CORS_ORIGINS);
