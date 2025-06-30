#!/usr/bin/env node

import { MainDB, ReplicaDB } from "../../../config/db.config";
import redis from "../../../config/redis.config";
import adminUtilies from "../admin.utilies";



class AdminUsersServiceClass {
   private configMainDB;
   private configReplicaDB;
   private configRedis;

   constructor () {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
      this.configRedis = redis;
   }

   public searchingUsersPaginated = async (page: number = 1, limit: number = 20, filteration: {
      search_by_company_name?: string, is_super_user?: boolean, created_at?: Date
   }) => {
      try {
         const where: any = {};

         // Only add is_super_user filter if it's defined
         if (filteration.is_super_user !== undefined) {
            where.is_super_user = filteration.is_super_user;
         }

         // Only add company name search if search term exists
         if (filteration.search_by_company_name?.trim()) {
            where.OR = [
               { Company_Member_User: { name: { contains: filteration.search_by_company_name.trim(), mode: "insensitive" } } },
               { Company_Super_User: { name: { contains: filteration.search_by_company_name.trim(), mode: "insensitive" } } }
            ];
         }

         // Only add created_at filter if date is valid
         if (filteration.created_at instanceof Date && !isNaN(filteration.created_at.getTime())) {
            where.created_at = { gte: filteration.created_at };
         }

         return (await this.configReplicaDB.user.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where,
            orderBy: [
               { company_id: "asc" },
               { created_at: "desc" }
            ]
         }))
      } catch (err) {
         throw (err);
      }
   }

   public totalUsersCount = async (filteration: {
      search_by_company_name?: string, is_super_user?: boolean, created_at?: Date
   }) => {
      try {
         const where: any = {};

         // Only add is_super_user filter if it's defined
         if (filteration.is_super_user !== undefined) {
            where.is_super_user = filteration.is_super_user;
         }

         // Only add company name search if search term exists
         if (filteration.search_by_company_name?.trim()) {
            where.OR = [
               { Company_Member_User: { name: { contains: filteration.search_by_company_name.trim(), mode: "insensitive" } } },
               { Company_Super_User: { name: { contains: filteration.search_by_company_name.trim(), mode: "insensitive" } } }
            ];
         }

         // Only add created_at filter if date is valid
         if (filteration.created_at instanceof Date && !isNaN(filteration.created_at.getTime())) {
            where.created_at = { gte: filteration.created_at };
         }

         return (await this.configReplicaDB.user.count({ where }));
      } catch (err) {
         throw (err);
      }
   }

   /**
    * Invalidates all user list cache entries
    * Should be called when users are modified
    */
   public invalidateUsersPaginationCache = async () => {
      try {
         const keys = await this.configRedis.keys("users:list:*");
         if (keys.length > 0)
            await this.configRedis.del(keys);
      } catch (err) {
         console.error('Error invalidating user list cache:', err);
      }
   }
}

const AdminUsersService = new AdminUsersServiceClass();
export default AdminUsersService;
