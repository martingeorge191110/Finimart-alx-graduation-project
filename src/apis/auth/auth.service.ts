#!/usr/bin/env ts-node
import { Company, RefreshToken, Reset_Password, User } from "../../../generated/prisma";
import { MainDB, ReplicaDB } from "../../config/db.config";
import bcrypt from "bcrypt";
import redis from "../../config/redis.config";


/**
 * @class AuthService
 * @description This class is used to handle the authentication service with the database
 */
class AuthServiceClass {
   private mainDB;
   private replicaDB;
   private configRedis;

   constructor() {
      this.mainDB = MainDB;
      this.replicaDB = ReplicaDB;
      this.configRedis = redis;
   };

   /**
    * @description This function is used to get a user by their email
    * @param email - The email of the user
    * @returns The user
    */
   public getUserByEmail = async (email: string): Promise<any> => {
      try {
         const user = await this.replicaDB.user.findUnique({
            where: { email }
         })

         return (user);
      } catch (err) {
         throw (err);
      }
   }

   /**
    * @description This function is used to create a refresh token for a user
    * @param user_id - The id of the user
    * @returns The token
    */
   public createRefreshToken = async (user_id: string, encrypted_token: string): Promise<RefreshToken> => {

      try {

         const refresh_token = await this.mainDB.refreshToken.create({
            data: {
               user_id, token: encrypted_token, expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) // 7 days
            }
         })

         return (refresh_token);
      } catch (err) {
         throw (err);
      }
   }

   /**
    * @description This function is used to get a refresh token by user id
    * @param user_id - The id of the user
    * @param refresh_token - The refresh token
    * @returns The refresh token
    */
   public getRefreshTokenByUserTokenId = async (tokenID: string, user_id: string): Promise<RefreshToken | null> => {
      try {
         const refresh_token_record: (RefreshToken | null) = await this.replicaDB.refreshToken.findUnique({
            where: { id: tokenID, user_id }
         })

         return (refresh_token_record);
      } catch (err) {
         throw (err);
      }
   }

      /**
    * @description This function is used to get a refresh token by the refresh token
    * @param refresh_token - The refresh token
    * @returns The refresh token
    */
   public getUserRefreshTokenByTokenID = async (id: string): Promise<RefreshToken | null> => {
      try {
         const refresh_token_record: (RefreshToken | null) = await this.replicaDB.refreshToken.findUnique({
            where: { id }
         })
   
            return (refresh_token_record);
         } catch (err) {
            throw (err);
      }
   }

   /**
    * @description This function is used to remove a refresh token
    * @param refresh_token_id - The id of the refresh token
    * @returns True if the refresh token is removed, false otherwise
    */
   public removeRefreshToken = async (refresh_token_id: string, user_id: string): Promise<boolean> => {
      try {
         await this.mainDB.refreshToken.delete({
            where: { id: refresh_token_id, user_id }
         })

         return (true);
      } catch (err) {
         throw (err);
      }
   }

   /**
    * @description This function is used to get a user by their id
    * @param user_id - The id of the user
    * @returns The user
    */
   public getUserById = async (user_id: string): Promise<Partial<User> | null> => {
      try {
         const user: (Partial<User> | null) = await this.replicaDB.user.findUnique({
            where: { id: user_id },
            select: {
               id: true, email: true, first_name: true, last_name: true,
               phone_number: true, is_super_user: true, is_blocked: true,
               user_role: true, company_id: true
            }
         })

         return (user);
      } catch (err) {
         throw (err);
      }
   }

   /**
    * @description This function is used to remove all refresh tokens expired
    * @param user_id - The id of the user
    * @returns True if the refresh tokens are removed, false otherwise
    */
   public removeAllRefreshTokensExpired = async (user_id: string): Promise<boolean> => {
      try {
         await this.mainDB.refreshToken.deleteMany({
            where: {
               user_id, expires_at: {
                  lt: new Date()
               }
            }
         })

         return (true)
      } catch (err) {
         throw (err);
      }
   }

   public refreshTokenCounter = async (user_id: string): Promise<number> => {
      try {
         return (await this.replicaDB.refreshToken.count({ where: { user_id } }));
      } catch (err) {
         throw (err);
      }
   }

   public removeAllRefreshTokens = async (user_id: string): Promise<boolean> => {
      try {
         await this.mainDB.refreshToken.deleteMany({ where: { user_id } })

         return (true);
      } catch (err) {
         throw (err);
      }
   }

   public getUserByIdRedis = async (user_id: string) => {
      try {
         return (await this.configRedis.get(`user:${user_id}`));
      } catch (err) {
         throw (err);
      }
   }

   public addUserToRedisById = async (user: Partial<User>) => {
      try {
         await redis.setEx(`user:${user.id}`, 3600, JSON.stringify(user));
      } catch (err) {
         throw (err);
      }
   }
};

/**
 * @description This is the instance of the AuthService class
 */
const authService = new AuthServiceClass();

export { authService, AuthServiceClass };
