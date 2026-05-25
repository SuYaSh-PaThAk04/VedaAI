import { createServer } from "node:http";
import { env } from "./config/env.js";
import { connectMongo } from "./db/mongo.js";
import { ensureRedisReady } from "./db/redis.js";
import { createApp } from "./app.js";
import { initSocketServer } from "./sockets/server.js";
import { subscribeToProgressEvents } from "./sockets/subscriber.js";

async function bootstrap() {
  await connectMongo();
  await ensureRedisReady();

  const app = createApp();
  const httpServer = createServer(app);

  await initSocketServer(httpServer);
  await subscribeToProgressEvents();

  httpServer.listen(env.PORT, "0.0.0.0", () => {
    console.log(`API listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start API server", error);
  process.exit(1);
});
