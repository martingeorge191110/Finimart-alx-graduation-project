#!/usr/bin/env node
import { Company } from "../../../generated/prisma";
import { ReplicaDB } from "../../config/db.config";
import redis from "../../config/redis.config";


class AdminUtilies {
   private configReplicaDB;
   private configRedis;
   constructor() {
      this.configReplicaDB = ReplicaDB;
      this.configRedis = redis;
   }

}

const adminUtilies = new AdminUtilies();
export default adminUtilies;
