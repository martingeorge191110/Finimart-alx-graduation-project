#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import ApiError from "../../../middlewares/error.handler";
import { Admin_JWT_PAYLOAD } from "../../../types/express";
import globalUtils from "../../../utilies/globals";
import { Category } from "../../../../generated/prisma";
import redis from "../../../config/redis.config";
import adminCategoryService from "./category.service";

class AdminCategoryControllerClass {
   private service;

   constructor() {
      this.service = adminCategoryService;
   }

   /**
    * @description - at first get creating the ne category
    *              - create the relation with the parent category, then response
    * @param req
    * @param res
    * @param next
    * @returns
    */
   public CreateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { category_name, parent_id, level, website_name } = req.body;

      try {
         if (!parent_id && level > 0) {
            return (next(ApiError.create_error("Parent ID is required for categories with level greater than", 500)));
         }
         const new_category = await this.service.creatNewCategoryByAdmin(category_name, website_name, level);


         if (parent_id && level > 0) {
            await this.service.createRelationToParents(new_category, parent_id);
         }
         await this.service.resetCategoryHierarchyRedis();

         // Invalidate the cache after creating a new category
         try {
            await redis.del("categories_hierarchy");
         } catch (cacheError) {
            console.error("Error invalidating category hierarchy cache:", cacheError);
         }

         return (globalUtils.SuccessfulyResponseJson(res, 201, "New Category has been added!", { ...new_category }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   };

   public CategoryListFilteration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { page, limit, level } = req.query;

      const page_number = Number(page) || 1;
      const limit_number = Number(limit) || 10;
      const level_number = level !== undefined ? Number(level) : undefined;

      try {
         const category_list = await this.service.getCategoryListPaginated(page_number, limit_number, level_number);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfully retrieved categories list", category_list));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public UpdateCategoryNames = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { website_name, category_name } = req.body;
      const category: Category = (req as any).category;

      try {
         const updated_category = await this.service.updateCategoryNames( category.id, category_name, website_name );

         // Invalidate the cache after creating a new category
         try {
            await redis.del("categories_hierarchy");
         } catch (cacheError) {
            console.error( "Error invalidating category hierarchy cache:", cacheError);
         }

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfully updated the category names", { ...updated_category }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public DeleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const category: Category = (req as any).category;

      try {
         const hasChildrenOrProducts = await this.service.hasChildrenOrProducts(category);

         // checking whether the product has any hierarchy (categories or products)
         if (hasChildrenOrProducts.hasChildren || hasChildrenOrProducts.hasProducts)
            return (next(ApiError.create_error("Cannot delete this category, it has children or products!", 400)));
         await this.service.resetCategoryHierarchyRedis();
         await this.service.deleteCategoryByID(category.id);

         return (globalUtils.SuccessfulyResponseJson( res, 200, "Successfully deleted the category", { id: category.id, category_name: category.category_name }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public CreateHierarchy = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
      const { parent_id, children_ids } = req.body;
      const parent_category: Category = (req as any).category;

      try {
         const categories = await this.service.getCategoriesByIDs(children_ids);

         for (const ele of categories) {
            if (ele.parent_id)
               return (next( ApiError.create_error("Children Categories have Parent!", 400)));

            let lvl_difference = ele.lvl - parent_category.lvl;
            if (lvl_difference < 0) lvl_difference = lvl_difference * -1;

            if (lvl_difference !== 1)
               return next( ApiError.create_error( "Cannot create a relation between these categories lvls", 400 ));
         }

         const isRelationExists = await this.service.existingRelation(children_ids, parent_id);

         if (isRelationExists)
            return next( ApiError.create_error( "There is a relation already between one of this categories and the choosen one!", 400));

         const updated_parent = await this.service.createRelationsByParent( categories, parent_id );

         // Invalidate the cache after creating new hierarchy
         try {
            await redis.del("categories_hierarchy");
         } catch (cacheError) {
            console.error( "Error invalidating category hierarchy cache:", cacheError );
         }

         return (globalUtils.SuccessfulyResponseJson( res, 201, "Relation between categories created successfully!", { ...updated_parent } ));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   };

   public getHierarchy = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
      try {
         // Try to get from Redis first
         const redis_category_hierarchy = await this.service.getCategoryHierarchyRedis();

         if (redis_category_hierarchy) {
            try {
               // Parse the Redis data
               const parsedHierarchy = JSON.parse(redis_category_hierarchy);
               return (globalUtils.SuccessfulyResponseJson( res, 200, "Successfully retrieved Categories Hierarchy from cache!", parsedHierarchy ));
            } catch (parseError) {
               // If parsing fails, log the error and proceed to fetch from DB
               console.error("Error parsing Redis cache:", parseError);
               // Don't return here, let it fall through to DB fetch
            }
         }

         // If Redis fails or is empty, get from DB
         const db_category_hierarchy = await this.service.getCategoryHierarchyDB();

         // Cache the result in Redis with a TTL of 1 hour (3600 seconds)
         try {
            await redis.setEx( "categories_hierarchy", 3600, JSON.stringify(db_category_hierarchy) );
         } catch (cacheError) {
            // Log cache error but don't fail the request
            console.error("Error caching category hierarchy:", cacheError);
         }

         return (globalUtils.SuccessfulyResponseJson( res, 200, "Successfully retrieved Categories Hierarchy from database!", db_category_hierarchy ));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   };

}

const adminCategoryController = new AdminCategoryControllerClass();
export default adminCategoryController;
