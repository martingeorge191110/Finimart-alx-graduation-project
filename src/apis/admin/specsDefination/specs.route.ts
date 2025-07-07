#!/usr/bin/env node
import { Router } from "express";
import { verifyAdminToken, isAdminAccount } from "../../../middlewares/admin.middlewares";
import adminSpecsValidator from "./specs.validator";
import ApiError from "../../../middlewares/error.handler";
import adminSpecsController from "./specs.controller";
import AdminAPIRoute from "../admin.api.route";


const AdminSpecsRoutes: Router = Router();

AdminSpecsRoutes.use(verifyAdminToken, isAdminAccount);


/**
 * @swagger
 * /api/v1/admin/specs/:
 *   post:
 *     summary: Add new specs definition
 *     tags: [Admin Specs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key_name, unit]
 *             properties:
 *               key_name:
 *                 type: string
 *               unit:
 *                 type: string
 *     responses:
 *       201:
 *         description: Specs definition created
 *   get:
 *     summary: Get all specs definitions
 *     tags: [Admin Specs]
 *     responses:
 *       200:
 *         description: List of specs definitions
 */
AdminSpecsRoutes.route("/")
   .post(
      adminSpecsValidator.addNewSpecsValid(), ApiError.validation_error,
      adminSpecsController.AddNewSpecs
   )
   .get(
      adminSpecsController.GetSpecDefinations
   )

/**
 * @swagger
 * /api/v1/admin/specs/{specs_id}/:
 *   put:
 *     summary: Update specs definition
 *     tags: [Admin Specs]
 *     parameters:
 *       - in: path
 *         name: specs_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key_name:
 *                 type: string
 *               unit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Specs definition updated
 *   delete:
 *     summary: Delete specs definition
 *     tags: [Admin Specs]
 *     parameters:
 *       - in: path
 *         name: specs_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Specs definition deleted
 */
AdminSpecsRoutes.route("/:specs_id/")
   .put(
      adminSpecsValidator.updateSpecsValid(), ApiError.validation_error,
      adminSpecsController.UpdateSpecDefination
   )

AdminSpecsRoutes.route("/:specs_id/")
   .delete(
      adminSpecsValidator.deleteSpecsValid(), ApiError.validation_error,
      adminSpecsController.deletespecsdefination_by_id
   )

export default AdminSpecsRoutes;
