#!/usr/bin/env node
import { v4 } from "uuid";
import { Admin, Admin_Refresh_Token } from "../../../../generated/prisma";
import { MainDB, ReplicaDB } from "../../../config/db.config";
import crypto from 'crypto';
import redis from "../../../config/redis.config";


/**
 * AuthServiceClass - Service layer for authentication operations
 *
 * Handles database operations related to admin authentication
 * @class AuthServiceClass
 */
class AdminAuthServiceClass {
   /**
    * Database instance for admin operations
    * @private
    * @type {typeof AdminsDB}
    */
   private configMainDB;
   private configReplicaDB;
   private configRedis;
   private readonly ADMIN_CACHE_TTL = 3600;

   /**
    * Creates an instance of AuthServiceClass
    * @constructor
    */
   constructor() {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
      this.configRedis = redis;
   }

   /**
    * Retrieves an admin by email address
    * @public
    * @param {string} email - The admin's email address
    * @returns {Promise<Admin | null>} The admin object if found, null otherwise
    * @throws {Error} Database operation errors
    */
   public getUserByEmail = async (email: string): Promise<Admin | null> => {
      try {
         const admin: (Admin | null) = await this.configMainDB.admin.findUnique({
            where: { email }
         })

         return (admin);
      } catch (err) {
         throw (err);
      }
   };

   public updateAdminWrongAttempts = async (id: string, admin_attempts: number, increase: boolean): Promise<void> => {
      const attempts = increase ? admin_attempts + 1 : 0;
      try {
         await this.configMainDB.admin.update({
            where: { id },
            data: { wrong_attempts: attempts }
         });

      } catch (err) {
         throw (err);
      }
   }

   public createRefreshToken = async(admin_id: string, token_encrypted: string): Promise<Admin_Refresh_Token> => {
      try {
         return (await this.configMainDB.admin_Refresh_Token.create({
            data: { admin_id, token: token_encrypted,
               expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) }
         }))
      } catch (err) {
         console.log(err)
         throw (err);
      }
   }

   /**
    * @description This function is used to remove all refresh tokens expired
    * @param user_id - The id of the user
    * @returns True if the refresh tokens are removed, false otherwise
    */
   public removeAllRefreshTokensExpired = async (admin_id: string): Promise<boolean> => {
      try {
         await this.configMainDB.admin_Refresh_Token.deleteMany({
            where: {
               admin_id, expires_at: {
                  lt: new Date()
               }
            }
         })

         return (true)
      } catch (err) {
         throw (err);
      }
   }

   public getAdminRefreshTokenByRefreshToken = async (id: string): Promise<Admin_Refresh_Token | null> => {
      try {
         const refreshToken = await this.configMainDB.admin_Refresh_Token.findUnique({
            where: { id }
         })

         return (refreshToken)
      } catch (err) {
         throw (err);
      }
   }

   public removeRefreshToken = async (id: string, admin_id: string): Promise<void> => {
      try {
         await this.configMainDB.admin_Refresh_Token.delete({
            where: { id, admin_id}
         });
      } catch (err) {
         throw (err);
      }
   }

   /**
    * Get admin from cache
    * @param admin_id The admin's ID
    * @returns The cached admin data or null if not found
    */
   public async getAdminFromCache(admin_id: string) {
      try {
         const cachedAdmin = await this.configRedis.get(`admin:${admin_id}`);
         return (cachedAdmin ? JSON.parse(cachedAdmin) : null);
      } catch (err) {
         console.error('Error getting admin from cache:', err);
         return (null);
      }
   }

   /**
    * Set admin in cache
    * @param admin_id The admin's ID
    * @param admin The admin data to cache
    */
   public async setAdminInCache(admin_id: string, admin: Admin): Promise<void> {
      try {
         await this.configRedis.setEx(`admin:${admin_id}`, this.ADMIN_CACHE_TTL, JSON.stringify(admin));
      } catch (err) {
         console.error('Error setting admin in cache:', err);
      }
   }

   public getAdminById = async (admin_id: string): Promise<Admin | null> => {
      try {
         return (await this.configMainDB.admin.findUnique({
            where: { id: admin_id }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public refreshTokenCouter = async (admin_id: string): Promise<number> => {
      try {
         return (await this.configReplicaDB.admin_Refresh_Token.count({
            where: { admin_id }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public removeAllRefreshToken = async (admin_id: string): Promise<void> => {
      try {
         await this.configMainDB.admin_Refresh_Token.deleteMany({
            where: { admin_id }
         });
      } catch (err) {
         throw (err);
      }
   }
}

/**
 * Default export instance of AuthServiceClass
 * @constant authService
 * @type {AuthServiceClass}
 */
const AdminAuthService = new AdminAuthServiceClass();
export default AdminAuthService;
