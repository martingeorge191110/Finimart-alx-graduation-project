#!/usr/bin/env node
import { Router } from "express";
import categoryController from "./category.controller";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";
import categoryValidation from "./category.validation";
import ApiError from "../../../middlewares/error.handler";
import adminCategoryValidation from "./category.validation";
import adminCategoryController from "./category.controller";

const CategoryRoutes: Router = Router();

CategoryRoutes.use(verifyAdminToken, isAdminAccount);

/**
 * @swagger
 * /api/v1/admin/categories/:
 *   post:
 *     summary: Create a new category
 *     tags: [Admin Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category_name, website_name, level]
 *             properties:
 *               category_name:
 *                 type: string
 *               website_name:
 *                 type: string
 *               level:
 *                 type: integer
 *               imge_url:
 *                 type: string
 *               parent_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation error
 *   get:
 *     summary: Get paginated/filterable list of categories
 *     tags: [Admin Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: level
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: List of categories
 */
CategoryRoutes.route("/")
   .post(
      categoryValidation.createCategoryValid(), ApiError.validation_error,
      categoryController.CreateCategory
   )
   .get(
      adminCategoryValidation.categoryListPaginationValid(), ApiError.validation_error,
      adminCategoryController.CategoryListFilteration
   )

/**
 * @swagger
 * /api/v1/admin/categories/hierarchy/:
 *   post:
 *     summary: Create category hierarchy relations
 *     tags: [Admin Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [parent_id, children_ids]
 *             properties:
 *               parent_id:
 *                 type: string
 *               children_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Hierarchy created
 *       400:
 *         description: Validation error
 *   get:
 *     summary: Get complete category hierarchy
 *     tags: [Admin Categories]
 *     responses:
 *       200:
 *         description: Category hierarchy
 */
CategoryRoutes.route("/hierarchy/")
   .post(
      categoryValidation.hierarchyVlidation(), ApiError.validation_error,
      categoryController.CreateHierarchy
   )
   .get(
      categoryController.getHierarchy
   );

/**
 * @swagger
 * /api/v1/admin/categories/{category_id}/:
 *   put:
 *     summary: Update category name or image
 *     tags: [Admin Categories]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category_name, website_name]
 *             properties:
 *               category_name:
 *                 type: string
 *               website_name:
 *                 type: string
 *               imge_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Validation error
 *   delete:
 *     summary: Delete a category
 *     tags: [Admin Categories]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       400:
 *         description: Validation error
 */
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
