#!/usr/bin/env node
import { Router } from "express";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/verify.admin.token";
import adminDashboardController from "./dashboard.controller";


const DashboardRoutes: Router = Router();

DashboardRoutes.use( verifyAdminToken, isAdminAccount );

DashboardRoutes.route("/stats/")
   .get(
      adminDashboardController.DashboardStats
   )


export default DashboardRoutes;
