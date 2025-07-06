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

   public getBestSellers =  async () => {
      try {
         return await this.configReplicaDB.best_Selling_Products.findMany({
            take: 8,
            orderBy: { created_at: 'desc' },
            select: { product_id: true,
               Product : {
                  select : {
                     product_title: true,
                     product_code: true,
                     description: true,
                     Brand : true,
                     price_range : true,
                     quantity: true,
                     is_active: true,
                     Product_Variant : {
                        select : { size: true,
                           price: true,
                           quantity: true,
                        }
                     }
                  }
               }
            }
         });
      } catch (err) {
         throw (err);
      }
   }

   public findProductByID = async (product_id: string) => {
      try {
         return (await this.configReplicaDB.product.findUnique({
            where: { id: product_id },
            include: {
               Product_Categories: true,
               Product_Variant: true
            }
         }));
      } catch (err) {
         throw (err);
      }
   }


   public updateProductDetails = async (product_id: string, dataBody: any) => {
      const { product_title, description, product_code, color, quantity, price_range, brand_id, category_id } = dataBody;

      // Step 1: Update the main product fields
      const productUpdateData: any = {
         product_title,
         description,
         product_code,
         color,
         quantity,
         price_range,
      };

      if (brand_id) {
         productUpdateData.Brand = {
            connect: { id: brand_id },
         };
      }

      try {
         // Update product
         const updatedProduct = await this.configMainDB.product.update({
            where: { id: product_id },
            data: productUpdateData,
         });

         // Step 2: Replace the category
         if (category_id) {
            // Delete old category relations
            await this.configMainDB.product_Categories.deleteMany({
               where: { product_id }
            });

            // Create new relation
            await this.configMainDB.product_Categories.create({
               data: {
                  product_id,
                  category_id,
               }
            });
         }

         return updatedProduct;
      } catch (err) {
         throw err;
      }
   };

   public deleteProductByID = async (product_id: string) => {
      try {
         await this.configMainDB.product.delete({
            where: { id: product_id }
         });
      } catch (err) {
         throw (err);
      }
   }

   public productActivation = async (product: Product, active: boolean) => {
      try {
         return (await this.configMainDB.product.update({
            where: { id: product.id },
            data: { is_active: active }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public getProductByID = async (id: string) => {
      try {
         return (await this.configReplicaDB.product.findUnique({
            where: { id },
            include: {
               Product_Specs: true
            }
         }));
      } catch (err) {
         throw (err);
      }
   }
}

const adminProductService = new AdminProductServiceClass();
export default adminProductService;
