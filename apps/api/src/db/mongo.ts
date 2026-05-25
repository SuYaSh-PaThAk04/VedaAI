import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(env.MONGODB_URI);
  return mongoose.connection;
}
