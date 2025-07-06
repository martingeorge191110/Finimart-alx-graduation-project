#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import categoryService from "./category.service";
import ApiError from "../../middlewares/error.handler";
import globalUtils from "../../utilies/globals";



class CategoryControllterClass {
   private service;

   constructor () {
      this.service = categoryService;
   }

   public RootCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         const root_categories_redis = await this.service.getRootCategoriesRedis();

         if (root_categories_redis)
            return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfully root categories retreived from the Cache!", root_categories_redis));

         const root_categories_DB = await this.service.getRootCategoriesDB();

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfully root categories retreived from the DB!", root_categories_DB));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public ProductsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { category_id } = req.params;
      const { page, limit } = req.query;
      const page_number = Number(page) || 1;
      const limit_number = Number(limit) || 4;

      try {
         const {
            products, total_products, total_pages, current_page
         } = await this.service.productsByCategoryPaginated(category_id, page_number, limit_number);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfully products retreived by category!", {
               products,
               total_products,
               total_pages,
               current_page
            }))
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

const categoryController = new CategoryControllterClass();
export default categoryController;
