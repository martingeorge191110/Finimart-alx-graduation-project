#!/usr/bin/env ts-node
import { PrismaClient } from '../../generated/prisma';


/**
 * Main Database Connection
 */
const MainDB = new PrismaClient({
   datasources: {
      db: {
         url: process.env.DATABASE_URL,
      },
   },
});

/**
 * Replica Database Connection
 */
const ReplicaDB = new PrismaClient({
   datasources: {
      db: {
         url: process.env.REPLICA_URL,
      },
   },
});

/**
 * Exporting the Database Connections
 */
export { MainDB, ReplicaDB };
