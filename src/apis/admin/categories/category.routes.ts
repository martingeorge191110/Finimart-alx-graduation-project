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
 * components:
 *   schemas:
 *     CreateCategoryRequest:
 *       type: object
 *       required:
 *         - category_name
 *       properties:
 *         category_name:
 *           type: string
 *           minLength: 3
 *           maxLength: 70
 *           example: "Electronics"
 *         parent_ids:
 *           type: array
 *           maxItems: 2
 *           items:
 *             type: string
 *           example: ["parent-id-1", "parent-id-2"]
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "New Category has been added!"
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Unique identifier of the category
 *             category_name:
 *               type: string
 *               description: Name of the category
 *             created_at:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the category was created
 *             updated_at:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the category was last updated
 *
 * @swagger
 * /api/categories/create:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create a new category
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Manager access required
 *       409:
 *         description: Category name exists
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/categories/hierarchy:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get complete category hierarchy
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved category hierarchy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "successfully Categories Hierarchy Retrieved!"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryWithChildren'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Manager access required
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create category hierarchy relations
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - parent_id
 *               - children_ids
 *             properties:
 *               parent_id:
 *                 type: string
 *                 example: "cat_123"
 *               children_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["cat_456", "cat_789"]
 *     responses:
 *       201:
 *         description: Hierarchy relations created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Manager access required
 *       500:
 *         description: Server error
 */
CategoryRoutes.route("/hierarchy/")
   .post(
      categoryValidation.hierarchyVlidation(), ApiError.validation_error,
      categoryController.CreateHierarchy
   )
   .get(
      categoryController.getHierarchy
   );

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
