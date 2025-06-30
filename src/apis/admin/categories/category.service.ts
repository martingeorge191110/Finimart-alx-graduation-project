import { promises } from "nodemailer/lib/xoauth2";
import { Category } from "../../../../generated/prisma";
import { MainDB, ReplicaDB } from "../../../config/db.config";
import redis from "../../../config/redis.config";



class AdminCategoryService {
   private configMainDB;
   private configReplicaDB;
   private configRedis;

   constructor () {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
      this.configRedis = redis;
   }

   public creatNewCategoryByAdmin = async (category_name: string, website_name: string, level: number): Promise<Category> => {
      try {
         return (await this.configMainDB.category.create({
            data: { category_name, website_name, lvl: level }
         }));
      } catch (err) {
         throw (err);
      }
   };

   public createRelationToParents = async (category: Category, parent_id: string) => {
      try {
         const parent_category = await this.configMainDB.category.findUnique({
            where: { id: parent_id }
         });

         if (!parent_category)
            throw (new Error("No Parent Category found with this ID!"));

         if (category.lvl - 1 !== parent_category.lvl)
            throw (new Error("Cannot create a relation between these categories lvls"));

         await this.configMainDB.category.update({
            where: { id: category.id },
            data: { parent_id: parent_category.id }
         });
      } catch (err) {
         throw err;
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

   public resetCategoryHierarchyRedis = async () => {
      try {
         return (await this.configRedis.del("categories_hierarchy"));
      } catch (err) {
         throw (err);
      }
   };

   private countAllDescendants = async (category_id: string): Promise<number> => {
      try {
         // Get immediate children
         const children = await this.configReplicaDB.category.findMany({
            where: { parent_id: category_id }
         });

         // If no children, return 0
         if (children.length === 0) return (0);

         // Count children of each child recursively
         const childrenCounts = await Promise.all(
            children.map(child => this.countAllDescendants(child.id))
         );

         let result = children.length;
         for (const count of childrenCounts)
            result += count;

         // Return total count: immediate children + all their descendants
         return (result);
      } catch (err) {
         throw (err);
      }
   }

   private findleafCategories = async (parent: Category) => {
      try {
         const children = await this.configReplicaDB.category.findMany({
            where: { parent_id: parent.id }
         });

         if (children.length === 0) return ([parent]);

         const leafCategories: Category[] = [];

         for (const child of children) {
            const childLeaves = await this.findleafCategories(child);
            leafCategories.push(...childLeaves);
         }

         return (leafCategories);
      } catch (err) {
         throw (err);
      }
   }

   public allCategoryProducts = async (category: Category): Promise<number> => {
      try {
         const leaf_children = await this.findleafCategories(category);

         const productCount = await Promise.all(
            leaf_children.map(async (leaf) => (
               this.configReplicaDB.product_Categories.count({
                  where: { category_id: leaf.id }
               }))
         ));

         let result = 0;
         for (const count of productCount)
            result += count;

         return (result)
      } catch (err) {
         throw (err);
      }
   }

   public getCategoryListPaginated = async (page: number, limit: number, level?: number) => {
      try {
         const categories = await this.configReplicaDB.category.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { created_at: "desc" },
            where: { lvl: level }
         });

         const categories_data = await Promise.all(
            categories.map(async (category, i) => {
               const children_count = await this.countAllDescendants(category.id);
               const total_products = await this.allCategoryProducts(category);

               return ({
                  ...category,
                  // no of levels
                  total_products,
                  children_count
               });
            })
         );


         return (categories_data);
      } catch (err) {
         throw (err);
      }
   }

   public updateCategoryNames = async (category_id: string, new_category_name: string, website_name: string): Promise<Category> => {
      try {
         return (await this.configMainDB.category.update({
            where: { id: category_id },
            data: { category_name: new_category_name, website_name }
         }));
      } catch (err) {
         throw (err);
      }
   }

   
   public hasChildrenOrProducts = async (category: Category) => {
      try {
         const hasChildren = await this.configReplicaDB.category.findFirst({
            where: { parent_id: category.id }
         });

         const hasProducts = await this.configReplicaDB.product_Categories.findFirst({
            where: { category_id: category.id }
         });

         return ({
            hasChildren: hasChildren ? true : false,
            hasProducts: hasProducts ? true : false
         })
      } catch (err) {
         throw (err);
      }
   }

   public deleteCategoryByID = async (category_id: string): Promise<void> => {
      try {
         await this.configMainDB.category.delete({
            where: { id: category_id }
         });
      } catch (err) {
         throw (err);
      }
   }
}

const adminCategoryService = new AdminCategoryService();
export default adminCategoryService;
