#!/usr/bin/env node
import { Router } from "express";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";
import adminDashboardController from "./dashboard.controller";


const DashboardRoutes: Router = Router();

DashboardRoutes.use(verifyAdminToken, isAdminAccount);

/**
 * @swagger
 * /api/v1/admin/dashboard/stats/:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
DashboardRoutes.route("/stats/")
   .get(
      adminDashboardController.DashboardStats
   )


export default DashboardRoutes;
