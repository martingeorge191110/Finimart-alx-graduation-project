#!/usr/bin/env node
import http from "http";
import { app } from "./app";
import dotenv from "dotenv";
import redisConfig from "./config/redis.config";

dotenv.config();

const server = http.createServer(app);
const PORT = Number(process.env.PORT);
const HOST = String(process.env.HOSTNAME);
const PROTOCOL = String(process.env.PROTOCOL);

// Error handling for the HTTP server
server.on("error", (err: NodeJS.ErrnoException) => {
   if (err.syscall !== "listen") {
      throw err;
   }

   // Handle specific listen errors with friendly messages
   switch (err.code) {
      case "EACCES":
         console.error(`${PORT} requires elevated privileges`);
         process.exit(1);
         break;
      case "EADDRINUSE":
         console.error(`${PORT} is already in use`);
         process.exit(1);
         break;
      default:
         throw err;
   }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
   console.log(`Server Listening to: ${PROTOCOL}://${HOST}:${PORT}`);
});

// Handle graceful shutdown
const gracefulShutdown = async () => {
   console.log("Received shutdown signal: closing HTTP server");
   server.close(async () => {
      console.log("HTTP server closed");
      await redisConfig.disconnect();
      process.exit(0);
   });

   // Force close after 10s
   setTimeout(() => {
      console.error(
         "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
   }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
