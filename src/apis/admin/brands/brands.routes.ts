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
 *     summary: Add a new brand
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
 *               brand_img_url:
 *                 type: string
 *             required:
 *               - name
 *               - brand_img_url
 *     responses:
 *       201:
 *         description: Brand created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/v1/admin/brands/:
 *   get:
 *     summary: Get all brands
 *     tags: [Admin Brands]
 *     responses:
 *       200:
 *         description: List of brands
 *       401:
 *         description: Unauthorized
 */
BrandsRoutes.route("/")
   .post(
      adminBrandsValidation.addNewBrandValidation(),
      ApiError.validation_error,
      adminBrandsController.AddNewBrand
   )
   .get(adminBrandsController.getBrands);

/**
 * @swagger
 * /api/v1/admin/brands/{brand_id}/:
 *   put:
 *     summary: Update a brand
 *     tags: [Admin Brands]
 *     parameters:
 *       - in: path
 *         name: brand_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               brand_img_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Brand updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Brand not found
 *   delete:
 *     summary: Delete a brand
 *     tags: [Admin Brands]
 *     parameters:
 *       - in: path
 *         name: brand_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand deleted
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Brand not found
 */
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
