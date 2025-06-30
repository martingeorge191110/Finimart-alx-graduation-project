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
}

const adminCategoryController = new AdminCategoryControllerClass();
export default adminCategoryController;
