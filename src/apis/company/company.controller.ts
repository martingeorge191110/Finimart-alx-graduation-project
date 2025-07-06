#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import {companyService} from "./company.service";
import ApiError from "../../middlewares/error.handler";
import { Company } from "../../../generated/prisma";
import globalUtils from "../../utilies/globals";




class CompanyControllerClass {
   private service;
   private MAX_USERS; // each company can have at most 10 users

   constructor () {
      this.service = companyService;
      this.MAX_USERS = 10;
   }

   public Dashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).company;

      try {
         const dashboard_redis = await this.service.getCompanyDashboardRedis(company.id);
         if (dashboard_redis)
            return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived the company dashboard from Cache!", JSON.parse(dashboard_redis)));

         const { total_paid, total_pending, total_orders } = await this.service.getCompanyDashboard(company.id);
         const total_paid_number = total_paid._sum.total_amount

         await this.service.setCompanyDashboardRedis(company.id, {total_paid: total_paid_number || 0, total_pending, total_orders});

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived the company dashboard from DB!", { total_paid: total_paid_number, total_pending, total_orders }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

}

const companyController = new CompanyControllerClass();
export default companyController;
