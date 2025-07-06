#!/usr/bin/env node
import { Router } from "express";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";
import { MulterIMGUploader } from "../../../middlewares/multer.uploader";
import { uploadCloudinaryPhoto } from "../../../middlewares/cloudinary";
import adminProductValidator from "./products.validators";
import ApiError from "../../../middlewares/error.handler";
import adminProductController from "./products.controller";
import productValidator from "../../products/products.validator";
import productController from "../../products/products.controller";
import adminBrandsController from "../brands/brands.controller";


const AdminProductRoutes: Router = Router();

AdminProductRoutes.use( verifyAdminToken , isAdminAccount);


AdminProductRoutes.route("/")
   .post(
      MulterIMGUploader('products').single('img'),
      adminProductValidator.createProductValidation(), ApiError.validation_error,
      uploadCloudinaryPhoto,
      adminProductController.CreateProduct
   )
   .get(
      adminProductValidator.productsPaginationValid(), ApiError.validation_error,
      adminProductController.GetProductsPagination
   )

AdminProductRoutes.route("/bestsellers/")
   .get(
      adminProductController.getBestSellingProducts
   )


   
export default AdminProductRoutes;
