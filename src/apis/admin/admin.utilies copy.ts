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

   public isUsersListCachable = (query: {
      page: number, limit: number, search_by_company_name?: string, is_super_user?: boolean, created_at?: Date
   }) => {
      // 1. There's a search term (these are unique and rarely repeated)
      if (query.search_by_company_name?.trim())
         return (false);

      // 2. Page is beyond first 3 pages (most users only browse first few pages)
      if (query.page > 3)
         return (false);

      // 3. Limit is not standard (only cache common page sizes)
      if (![10, 20, 50].includes(query.limit))
         return (false);

      // 4. Created_at filter is present (these are usually unique queries)
      if (query.created_at)
         return (false);

      // 5. is_super_user filter is present (only cache the default view)
      if (query.is_super_user !== undefined)
         return (false);

      return (true);
   }

   /**
    * Generates a cache key for user list
    * Uses a simplified key structure to minimize the number of keys
    */
   public generateUserListCacheKey = (query: {
      page: number,
      limit: number
   }) => {
      return (`users:list:p${query.page}:l${query.limit}`);
   }
}

const adminUtilies = new AdminUtilies();
export default adminUtilies;
