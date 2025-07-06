#!/usr/bin/env node
import { Router } from "express";
import productController from "./products.controller";
import { verifyToken } from "../../middlewares/verify.token";
import productValidator from "./products.validator";
import ApiError from "../../middlewares/error.handler";



const ProductRoutes: Router = Router();

// ProductRoutes.use(verifyToken);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Search products by title
 *     description: Search for products by their title. Can search across all products or within a specific category hierarchy.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *         description: Product title to search for (case-insensitive)
 *         example: "laptop"
 *       - in: query
 *         name: root
 *         schema:
 *           type: string
 *         description: Category root ID or 'all' to search across all products
 *         example: "all"
 *     responses:
 *       200:
 *         description: Products found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Products fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       product_title:
 *                         type: string
 *                       url_img:
 *                         type: string
 *                       product_code:
 *                         type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: No products found
 *       500:
 *         description: Internal server error
 */
ProductRoutes.route('/') // ?search=name&root=all or specific id
   .get(
      productValidator.productSearchValid(), ApiError.validation_error,
      productController.GetProductSearch
   )

/**
 * @swagger
 * /api/v1/products/filter:
 *   get:
 *     summary: Get filtered products with pagination
 *     description: Filter products by category, brand, price range, and pagination. At least one query parameter is required.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: root_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Root category ID
 *       - in: query
 *         name: lvl1
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Level 1 category ID
 *       - in: query
 *         name: lvl2
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Level 2 category ID
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Brand ID (use "null" for no filter)
 *       - in: query
 *         name: price_range
 *         schema:
 *           type: string
 *           default: "Economic"
 *         description: Price range label
 *       - in: query
 *         name: minPriceRange
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price
 *       - in: query
 *         name: maxPriceRange
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price
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
 *                     pagination:
 *                       type: object
 *                     products:
 *                       type: array
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
ProductRoutes.route('/filter/')
   .get(
      productValidator.getFilteredProductsValid(), ApiError.validation_error,
      productController.GetFilteredProductsList
   )

/**
 * @swagger
 * /api/v1/products/{product_id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a specific product with full details including categories, brand, specs, and variants.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           minLength: 5
 *           maxLength: 50
 *         description: Product UUID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
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
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
ProductRoutes.route("/:product_id/")
   .get(
      productValidator.productParamValidID(), ApiError.validation_error,
      productController.getProduct
   )

/**
 * @swagger
 * /api/v1/products/best-selling:
 *   get:
 *     summary: Get best selling products
 *     description: Retrieve top 8 best selling products ordered by creation date.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Best selling products retrieved successfully
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
 *       404:
 *         description: No best selling products found
 *       500:
 *         description: Server error
 */
ProductRoutes.route("/best-selling/")
   .get(
      productController.getBestSellingProductsList
   )


export default ProductRoutes;
