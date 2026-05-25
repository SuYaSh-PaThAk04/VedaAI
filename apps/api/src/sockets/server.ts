import type { Server as HttpServer } from "node:http";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { redisPub, redisSub } from "../db/redis.js";
import {
  assignmentRoom,
  type ClientToServerEvents,
  type ServerToClientEvents
} from "./events.js";

export type AppSocketServer = Server<ClientToServerEvents, ServerToClientEvents>;

let io: AppSocketServer | undefined;

export async function initSocketServer(httpServer: HttpServer) {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: env.WEB_URL,
      credentials: true
    }
  });

  io.adapter(createAdapter(redisPub, redisSub));

  io.on("connection", (socket) => {
    socket.on("assignment:subscribe", (assignmentId) => {
      socket.join(assignmentRoom(assignmentId));
    });
  });

  return io;
}

export function getSocketServer() {
  if (!io) {
    throw new Error("Socket server has not been initialized.");
  }

  return io;
}
