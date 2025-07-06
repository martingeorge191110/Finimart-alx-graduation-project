#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import productService from "./products.services";
import ApiError from "../../middlewares/error.handler";
import globalUtils from "../../utilies/globals";




class ProductsControllerClass {
   private service;

   constructor () {
      this.service = productService;
   }


   public getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { product_id } = req.params;

      try {
         const product_redis = await this.service.getProductByIdRedis(product_id);
         if (product_redis)
            return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfully retrieved Product from cache!", { ...JSON.parse(product_redis) }));

         const product_DB = await this.service.getProductByIdDB(product_id);

         if (!product_DB)
            return (next(ApiError.create_error("Product is not Found!", 404)));

         await this.service.setProductInRedis(product_id, product_DB);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfully retrieved Product from DB!", product_DB))
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public getBestSellingProductsList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         const bestSellingProductsRedis = await this.service.getBestSellersRedis();

         if (bestSellingProductsRedis)
            return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfully retrieved Best Sellers from cache!", bestSellingProductsRedis));

         const bestSellingProductsDB = await this.service.getBestSellersListDB();

         if (!bestSellingProductsDB)
            return (next(ApiError.create_error("Best Sellers Products are not Found!", 404)));

         await this.service.setBestSellersRedis(bestSellingProductsDB);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Best Selling Products fetched successfully!", bestSellingProductsDB));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetProductSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { search, root } = req.query;
      const searchString = String(search);
      const rootString = String(root);

      try {
         const products = await this.service.getProductSearch(searchString, rootString);

         if (!products || products.length === 0)
            return (next(ApiError.create_error("Products not found!", 404)));

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Products fetched successfully!", products));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetFilteredProductsList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const query = req.query;

      if (Object.keys(query).length === 0)
         return next(ApiError.create_error("Query parameters are required!", 400));

      try {
         const result = await productService.getProductList(query);

         return globalUtils.SuccessfulyResponseJson(res, 200, "Product list fetched successfully", result);
      } catch (err) {
         return next(ApiError.create_error(String(err), 500));
      }
   };
}

const productController = new ProductsControllerClass();
export default productController;
