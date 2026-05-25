import cors from "cors";
import express from "express";
import helmet from "helmet";
import { corsOrigins } from "./config/env.js";
import { isAllowedCorsOrigin } from "./config/cors.js";
import { assignmentsRouter } from "./routes/assignments.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedCorsOrigin(origin, corsOrigins)) {
          callback(null, origin ?? corsOrigins[0]);
          return;
        }

        callback(new Error(`Origin ${origin ?? "unknown"} is not allowed by CORS`));
      },
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
