#!/usr/bin/env node
import { Router } from "express";
import adminBrandsController from "./brands.controller";
import adminBrandsValidation from "./brands.validation";
import ApiError from "../../../middlewares/error.handler";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";

const BrandsRoutes: Router = Router();

BrandsRoutes.use(verifyAdminToken, isAdminAccount);

/**
 * @swagger
 * /api/v1/admin/brands/:
 *   post:
 *     summary: Add new brand
 *     tags: [Admin Brands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Brand name (unique name)
 *               brand_img_url:
 *                 type: string
 *                 description: URL of the brand image and must be a valid image URL
 *             required:
 *               - name
 *               - brand_img_url
 *     responses:
 *       201:
 *         description: New Brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   type: object
 *                   description: The newly created brand object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique identifier for the brand
 *                     name:
 *                       type: string
 *                       description: Name of the brand
 *                     brand_img_url:
 *                       type: string
 *                       description: URL of the brand image
 *       400:
 *         description: Bad request, validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     summary: Get all brands
 *     tags: [Admin Brands]
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   type: array
 *                   description: Array of brand objects
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier for the brand
 *                       name:
 *                         type: string
 *                         description: Name of the brand
 *                       brand_img_url:
 *                         type: string
 *                         description: URL of the brand image
 *       401:
 *         description: Unauthorized, invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
BrandsRoutes.route("/")
   .post(
      adminBrandsValidation.addNewBrandValidation(),
      ApiError.validation_error,
      adminBrandsController.AddNewBrand
   )
   .get(adminBrandsController.getBrands);

BrandsRoutes.route("/:brand_id/")
   .put(
      adminBrandsValidation.updateBrandValidation(),
      ApiError.validation_error,
      adminBrandsController.updateBrand
   )
   .delete(
      adminBrandsValidation.deleteBrandValidation(),
      ApiError.validation_error,
      adminBrandsController.deleteBrand
   );

export default BrandsRoutes;
