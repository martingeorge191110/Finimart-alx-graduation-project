#!/usr/bin/env node
import { Brand } from "../../../../generated/prisma";
import { MainDB, ReplicaDB } from "../../../config/db.config";



class AdminBrandsServiceClass {
   private configMainDB;
   private configReplicaDB;

   constructor () {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
   }

   public findBrandByName = async (name: string) => {
      try {
         return (await this.configReplicaDB.brand.findFirst({
            where: { name }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public createNewBrand = async (name: string, brand_img_url: string): Promise<Brand> => {
      try {
         return (await this.configMainDB.brand.create({
            data: { name, img_url: brand_img_url }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public getAllBrands = async () => {
      try {
         return (await this.configReplicaDB.brand.findMany());
      } catch (err) {
         throw (err);
      }
   }

   public updateBrand = async (brand_id: string, name?: string, brand_img_url?: string
   ): Promise<Brand> => {
      try {
         const updateData: Record<string, any> = {};

         if (name !== undefined) updateData.name = name;
         if (brand_img_url !== undefined) updateData.img_url = brand_img_url;

         return await this.configMainDB.brand.update({
            where: { id: brand_id },
            data: updateData
         });
      } catch (err) {
         throw err;
      }
   }

   public deleteBrand = async (brand_id: string): Promise<Brand> => {
      try {
         return (await this.configMainDB.brand.delete({
            where: { id: brand_id }
         }));
      } catch (err) {
         throw (err);
      }
   }
}

const adminBrandsService = new AdminBrandsServiceClass();
export default adminBrandsService;
