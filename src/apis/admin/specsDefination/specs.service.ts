#!/usr/bin/env node

import { MainDB, ReplicaDB } from "../../../config/db.config";
import redis from "../../../config/redis.config";



class AdminSpecsServiceClass {
   private configMainDB;
   private configReplicaDB;
   private configRedis;

   constructor () {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
      this.configRedis = redis;
   }


   public static createInstance = () => (new AdminSpecsServiceClass())

   public createSpecsDef = async (key_name: string, unit: string) => {
      try {
         return (await this.configMainDB.specs_Defination.create({
            data: { key_name, unit }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public getAllSpecsDB = async () => {
      try {
         return (await this.configReplicaDB.specs_Defination.findMany({
            select: { id: true, key_name: true, unit: true }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public getAllSpecsRedis = async () => {
      try {
         return (await this.configRedis.get(`specs_definations`));
      } catch (err) {
         throw (err);
      }
   }

   public resetSpecsDefinationsRedis = async () => {
      try {
         await this.configRedis.del('specs_definations');
      }
      catch (err) {
         throw (err);
      }
   }
   
   public setSpecsDefinationsRedis = async (specs: {
      id: string, key_name: string, unit: string
   }[]) => {
      try {
         await this.configRedis.setEx('specs_definations', 3600, JSON.stringify(specs));
      } catch (err) {
         throw (err);
      }
   }

   public getSepcsByIDDB = async (specs_id: string) => {
      try {
         return (await this.configReplicaDB.specs_Defination.findUnique({
            where: { id: specs_id }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public getSepcsByIDRedis = async (specs_id: string) => {
      try {
         return (await this.configRedis.get(`specs:${specs_id}`));
      } catch (err) {
         throw (err);
      }
   }

   public updateSpecsDefination = async (specs_id: string, key_name?: string, unit?: string) => {
      try {
         return (await this.configMainDB.specs_Defination.update({
            where: { id: specs_id },
            data: { key_name, unit }
         }))
      } catch (err) {
         throw (err);
      }
   }

   public deletespecsdefination_by_id = async (specs_id: string): Promise<void> => {
      try {
         await this.configMainDB.specs_Defination.delete({
            where: { id: specs_id },
         });
      } catch(err) {
         throw(err);
      }
   }
}

const adminSpecsService = AdminSpecsServiceClass.createInstance();
export default adminSpecsService;
