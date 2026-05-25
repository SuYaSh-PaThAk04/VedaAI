import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { assignmentsRouter } from "./routes/assignments.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_URL,
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/assignments", assignmentsRouter);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: err.message || "Unexpected server error." });
  });

  return app;
}
