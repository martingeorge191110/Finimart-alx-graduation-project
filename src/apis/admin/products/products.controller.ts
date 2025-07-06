#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import ApiError from "../../../middlewares/error.handler";
import adminProductService from "./prodcuts.service";
import { Brand, Category } from "../../../../generated/prisma";
import globalUtils from "../../../utils/globals";
import { deleteCloudinaryImage, uploadImageToCloudinary } from "../../../middlewares/cloudinary";
import { isAdminAccount } from "../../../middlewares/admin.middlewares";
import productService from "../../products/products.services";



class AdminProductsControllerClass {
   private service;
   private pservice;
   constructor() {
      this.pservice = productService;
      this.service = adminProductService;
   }

   public CreateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { product_title, description, product_code, color, quantity, price_range } = req.body;
      const brand: Brand = (req as any).brand;
      const category: Category = (req as any).category;
      const img_url = (req as any).product_img_url;
      const numberQuantity = Number(quantity);

      try {
         const newProduct = await this.service.addNewProduct(
            product_title, description, product_code,
            numberQuantity, price_range, brand, category, img_url, color
         );

         return (globalUtils.SuccessfulyResponseJson(res, 201, "Product Created Successfully", { ...newProduct }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   };

   public GetProductsPagination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { page, limit, search_by_code, is_active } = req.query;
      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 20;
      const is_active_value = is_active === 'true' ? true : is_active === 'false' ? false : undefined;

      const filteration = {
         search_by_code: search_by_code ? String(search_by_code) : undefined,
         is_active: is_active_value
      }

      try {
         const { total, products } = await this.service.getProductsPaginated(pageNumber, limitNumber, filteration);
         const total_pages = Math.ceil(total / limitNumber);
         const has_next_page = pageNumber < total_pages;
         const has_previous_page = pageNumber > 1;

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Products fetched successfully!", {
            products, total_products: total, total_pages, has_next_page, has_previous_page
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public getBestSellingProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         const bestSellingProducts = await this.service.getBestSellers();
         if (!bestSellingProducts || bestSellingProducts.length === 0) {
            return globalUtils.SuccessfulyResponseJson(res, 200, "No best selling products found.", []);
         }
         return (globalUtils.SuccessfulyResponseJson(res, 200, "Best Selling Products fetched successfully!", bestSellingProducts));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

const adminProductController = new AdminProductsControllerClass();
export default adminProductController;
