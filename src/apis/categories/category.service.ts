#!/usr/bin/env node
import { Category } from "../../../generated/prisma";
import { MainDB, ReplicaDB } from "../../config/db.config";
import redis from "../../config/redis.config";
import adminUtilies from "../admin/admin.utilies";

class CategoryServiceClass {
   private configMainDB;
   private configReplicaDB;
   private configRedis;

   constructor() {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
      this.configRedis = redis;
   }

   public findFamiliarCategory = async (new_category_name: string): Promise<Category | null> => {
      try {
         return (await this.configReplicaDB.category.findFirst({
            where: { category_name: new_category_name }
         }));
      } catch (err) {
         throw (err);
      }
   };

   public getCategoryByID = async (category_id: string): Promise<Category | null> => {
      try {
         return (await this.configReplicaDB.category.findUnique({
            where: { id: category_id }
         }));
      } catch (err) {
         throw (err);
      }
   };

   public getCategoriesByIDs = async (ids: string[]): Promise<Category[]> => {
      try {
         return (await this.configMainDB.category.findMany({
            where: { id: { in: ids } }
         }));
      } catch (err) {
         throw (err);
      }
   };

   public createRelationsByParent = async (children: Category[], parent_id: string) => {
      try {
         return (await this.configMainDB.category.update({
            where: { id: parent_id },
            data: {
               Children: {
                  connect: children.map((child) => ({ id: child.id }))
               }
            },
            include: {
               Children: {
                  select: {
                     id: true, category_name: true, lvl: true, created_at: true
                  }
               }
            }
         }));
      } catch (err) {
         throw (err);
      }
   };

   public existingRelation = async (children_ids: string[], parent_id: string): Promise<boolean> => {
      try {
         const isRelation = await this.configReplicaDB.category.findFirst({
            where: { id: { in: children_ids }, parent_id }
         })

         if (isRelation) return (true);

         return (false);
      } catch (err) {
         throw (err);
      }
   };

   public getRootCategoriesRedis = async () => {
      try {
         return (await redis.get("root_categories"));
      } catch (err) {
         throw (err);
      }
   }
   public getRootCategoriesDB = async () => {
      try {
         return (await this.configReplicaDB.category.findMany({
            where: { lvl: 0 }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public productsByCategoryPaginated = async (category_id: string, page: number, limit: number) => {
      try {
         const [products, total_products] = await Promise.all([
            this.configReplicaDB.product_Categories.findMany({
               skip: (page - 1) * limit,
               take: limit,
               where: { category_id },
               include: {
                  Product: {
                     select: {
                        id: true,
                        product_title: true,
                        url_img: true,
                        description: true
                     }
                  }
               }
            }),
            this.configReplicaDB.product_Categories.count({ where: { category_id } })
         ]);

         const total_pages = Math.ceil(total_products / limit);
         return ({
            products,
            total_products,
            total_pages,
            current_page: page
         });
      } catch (err) {
         throw (err);
      }
   }
}

const categoryService = new CategoryServiceClass();
export default categoryService;
