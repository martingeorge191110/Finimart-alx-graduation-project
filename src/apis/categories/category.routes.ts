#!/usr/bin/env node
import { Router } from "express";
import { verifyToken } from "../../middlewares/verify.token";
import categoryController from "./category.controller";
import CategoryValidation from "./category.validation";
import ApiError from "../../middlewares/error.handler";

const CategoryRoutes: Router = Router();
const { validateProductsCategory } = CategoryValidation.getInstance();

CategoryRoutes.use(verifyToken);

/**
 * @swagger
 * /api/v1/categories/roots:
 *   get:
 *     summary: Get root categories
 *     description: Retrieve all root categories (parent categories). Uses Redis caching for performance.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Root categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *       500:
 *         description: Server error
 */
CategoryRoutes.route("/roots/")
   .get(categoryController.RootCategories)

/**
 * @swagger
 * /api/v1/categories/{category_id}/products:
 *   get:
 *     summary: Get products by category
 *     description: Retrieve paginated products for a specific category.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category UUID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 4
 *         description: Products per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                     total_products:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     current_page:
 *                       type: integer
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
// GET: /api/v1/categories/:category_id/products?page=1&limit=10
//    :category_id is the ID of the category
CategoryRoutes.route("/:category_id/products/")
   .get(
      validateProductsCategory(), ApiError.validation_error, categoryController.ProductsByCategory
   );

export default CategoryRoutes;
