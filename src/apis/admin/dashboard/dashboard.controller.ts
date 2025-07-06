#!/usr/bin/env node
import { Request, Response, NextFunction } from "express";
import adminDashboardService from "./dashboard.service";
import ApiError from "../../../middlewares/error.handler";
import { Admin_JWT_PAYLOAD } from "../../../types/express";
import globalUtils from "../../../utils/globals";



class AdminDashboardControllerClass {
   private service;

   constructor () {
      this.service = adminDashboardService;
   }

   public DashboardStats = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const stats_redis = await this.service.getStatsRedis();
         if (stats_redis)
            return (globalUtils.SuccessfulyResponseJson(res, 200, "Succesfully retreived Dashboard Stats from Cache", JSON.parse(stats_redis)));

         const stats_DB = await this.service.getStatsDB();
         if (!stats_DB)
            return (next(ApiError.create_error("No Data Found", 404)));

         await this.service.setStatsRedis(stats_DB);
         return (globalUtils.SuccessfulyResponseJson(res, 200, "Succesfully retreived Dashboard Stats from DB", stats_DB));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

const adminDashboardController = new AdminDashboardControllerClass();
export default adminDashboardController;
