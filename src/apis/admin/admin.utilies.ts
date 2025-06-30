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

   
   /**
    * @description - Recursion function that retreieve the children hierarchy
    * @param categories - Root Categories to get children hierarchy
    * @returns - Children of the parents!
    */
   public buildCategoryHierarchy = async (categories: any[]): Promise<any> => {
      const hierarchy = await Promise.all(
         categories.map(async (category: any) => {
            const children = await this.configReplicaDB.category.findMany({
               where: { parent_id: category.id },
               include: { Children: true },
            });

            return {
               ...category,
               Children:
                  children.length > 0
                     ? await this.buildCategoryHierarchy(children)
                     : [],
            };
         })
      );

      return (hierarchy);
   };

}

const adminUtilies = new AdminUtilies();
export default adminUtilies;
