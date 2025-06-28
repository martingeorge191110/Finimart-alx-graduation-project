import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

class RedisConfig {
   private static instance: RedisConfig;
   private client: ReturnType<typeof createClient>;

   private constructor() {
      this.client = createClient({
         url: process.env.REDIS_URL || "redis://localhost:6379",
         socket: {
            reconnectStrategy: (retries) => {
               if (retries > 10) {
                  console.error("Redis max retries reached. Giving up...");
                  return new Error("Redis max retries reached");
               }
               return Math.min(retries * 100, 3000);
            },
         },
      });

      this.client.on("error", (err) => console.error("Redis Client Error:", err));
      this.client.on("connect", () => console.log("Redis Client Connected"));
      this.client.on("reconnecting", () =>
         console.log("Redis Client Reconnecting")
      );
      this.client.on("ready", () => console.log("Redis Client Ready"));
   }

   public static getInstance(): RedisConfig {
      if (!RedisConfig.instance) {
         RedisConfig.instance = new RedisConfig();
      }
      return RedisConfig.instance;
   }

   public async connect(): Promise<void> {
      if (!this.client.isOpen) {
         await this.client.connect();
      }
   }

   public async disconnect(): Promise<void> {
      if (this.client.isOpen) {
         await this.client.disconnect();
      }
   }

   public getClient() {
      return (this.client);
   }
}

const redisConfig = RedisConfig.getInstance();

// Initialize Redis connection
(async () => {
   try {
      await redisConfig.connect();
      console.log("Redis connection initialized successfully");
   } catch (error) {
      console.error("Failed to initialize Redis connection:", error);
      process.exit(1); // Exit if Redis connection fails
   }
})();

const redis = redisConfig.getClient();

export default redis;
