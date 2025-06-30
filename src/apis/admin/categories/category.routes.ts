#!/usr/bin/env node
import { Router } from "express";
import categoryController from "./category.controller";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/verify.admin.token";
import categoryValidation from "./category.validation";
import ApiError from "../../../middlewares/error.handler";
import adminCategoryValidation from "./category.validation";
import adminCategoryController from "./category.controller";

const CategoryRoutes: Router = Router();

CategoryRoutes.use(verifyAdminToken, isAdminAccount);


CategoryRoutes.route("/")
   .post(
      categoryValidation.createCategoryValid(), ApiError.validation_error,
      categoryController.CreateCategory
   )
   .get(
      // need to add the caching process
      adminCategoryValidation.categoryListPaginationValid(), ApiError.validation_error,
      adminCategoryController.CategoryListFilteration
   )


CategoryRoutes.route("/:category_id/")
   .put(
      adminCategoryValidation.updateCategoryValid(), ApiError.validation_error,
      adminCategoryController.UpdateCategoryNames
   )
   .delete(
      adminCategoryValidation.categoryIDParamValid(), ApiError.validation_error,
      adminCategoryController.DeleteCategory
   );


export default CategoryRoutes;
