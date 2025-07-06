#!/usr/bin/env node
import { dmmfToRuntimeDataModel } from "@prisma/client/runtime/library";
import { Brand, Category, PriceRange, Product, Specs_Defination } from "../../../../generated/prisma";
import { MainDB, ReplicaDB } from "../../../config/db.config";
import redis from "../../../config/redis.config";
import { promises } from "nodemailer/lib/xoauth2";

class AdminProductServiceClass {
   private configRedis;
   private configMainDB;
   private configReplicaDB;

   constructor() {
      this.configRedis = redis;
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
   }

   public addNewProduct = async (
      product_title: string, description: string, product_code: string,
      quantity: number, price_range: string, brand: Brand,
      category: Category, img_url: string, color?: string | null
   ) => {
      try {
         return (await this.configMainDB.product.create({
            data: {
               product_title, description, product_code, color: color ? color : null,
               quantity, price_range: price_range as PriceRange, url_img: img_url,
               brand_id: brand.id, Product_Categories: {
                  create: { category_id: category.id },
               },
            },
         }));
      } catch (err) {
         throw (err);
      }
   };

   public getProductsPaginated = async (page: number, limit: number, filteration: {
      search_by_code?: string, is_active?: boolean
   }) => {
      try {
         const where: any = {};

         if (filteration.search_by_code)
            where.product_code = { contains: filteration.search_by_code, mode: 'insensitive' };

         if (filteration.is_active)
            where.is_active = filteration.is_active;

         const [total, products] = await Promise.all([
            this.configReplicaDB.product.count({
               where
            }),
            this.configReplicaDB.product.findMany({
               skip: (page - 1) * limit,
               take: limit + 1,
               include: {
                  Brand: {
                     select: { id: true, name: true }
                  },
                  Product_Categories: {
                     select: {
                        Category: {
                           select: { id: true, category_name: true }
                        }
                     }
                  },
               },
               where
            })
         ])

         return ({
            total, products
         });
      } catch (err) {
         throw (err);
      }
   }
}

const adminProductService = new AdminProductServiceClass();
export default adminProductService;
