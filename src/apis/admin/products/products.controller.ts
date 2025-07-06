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

   public UpdateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { product_id } = req.params;
      console.log("Booooooooooooody", req.body);
      const { product_title, description, product_code, color, quantity, price_range, brand_id, category_id } = req.body;
      const numberQuantity = Number(quantity);
      await productService.resetProductCache(product_id);

      const dataBody = {
         product_title,
         description,
         product_code,
         color,
         quantity: numberQuantity,
         price_range,
         brand_id,
         category_id,
      };

      try {
         const find_product = await this.service.findProductByID(product_id);

         if (!find_product)
            return (next(ApiError.create_error("In Valid Product!", 404)));

         for (const ele of find_product.Product_Categories)
            if (ele.category_id === category_id)
               return (next(ApiError.create_error("This Product has relation with the category!", 400)));
         await productService.resetProductCache(product_id);

         const updatedProduct = await this.service.updateProductDetails(product_id, dataBody);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Product Updated Successfully", { ...updatedProduct }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)))
      }
      
   }

   public DeleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { product_id } = req.params;

      try {
         const find_product = await this.service.findProductByID(product_id);

         if (!find_product)
            return (next(ApiError.create_error("Invalid Product!", 404)));

         if (find_product.is_active)
            return (next(ApiError.create_error("You cannot delete an active product!", 400)));

         await this.service.deleteProductByID(product_id);
         await productService.resetProductCache(product_id);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfully Deleted the product!"));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public ProductActivation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { active } = req.body;
      const { product_id } = req.params;

      try {
         const product = await this.service.getProductByID(product_id);

         if (!product)
            return (next(ApiError.create_error("Product not Found!", 404)));

         if (product.is_active === active)
            return (next(ApiError.create_error(`activation is already ${active}`, 400)));
         
         await productService.resetProductCache(product_id);

         const updated_product = await this.service.productActivation(product, active);

         return (globalUtils.SuccessfulyResponseJson(res, 200, `Successfully Updated the activation status!`, { ...updated_product }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public updateProductImg = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const file = req.file;
      const { product_id } = req.params;

      try {
         if (!file)
            throw (new Error("No Image Uploaded!"));

         const find_product = await this.service.findProductByID(product_id);

         if (!find_product)
            return (next(ApiError.create_error("Invalid Product!", 404)));

         const current_img_url = find_product.url_img;
         const isDeleted = await deleteCloudinaryImage(current_img_url);

         if (!isDeleted)
            throw (new Error("Failed to remove the image!"));

         const { secure_url } = await uploadImageToCloudinary(file.path);

         const updated_product = await this.service.updateProductImage(find_product.id, secure_url);
         await productService.resetProductCache(product_id);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfully Updated the product image!", { ...updated_product }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

}

const adminProductController = new AdminProductsControllerClass();
export default adminProductController;
