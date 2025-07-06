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

   public GetPendingOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).payload
      const { order_no, page, Limit } = req.query;
      const order_no_value: (number | undefined) = order_no ? Number(order_no) : undefined;
      const page_value: number = page ? Number(page) : 1;
      const limit_value: number = Limit ? Number(Limit) : 10;

      try {
         const {
            orders, total_orders, total_pages, current_page, limit
         } = await this.service.getPendingOrders(company.id, page_value, limit_value, order_no_value);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived the pending orders!", {
            orders,
            total_orders,
            total_pages,
            current_page: current_page || 1,
            limit: limit || 10
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetOrdersHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).company;
      const { order_no, page, Limit } = req.query;
      const order_no_value: (number | undefined) = order_no ? Number(order_no) : undefined;
      const page_value: number = page ? Number(page) : 1;
      const limit_value: number = Limit ? Number(Limit) : 10;

      try {
         const {
            orders, total_orders, total_pages, current_page, limit
         } = await this.service.getOrdersHistory(company.id, page_value, limit_value, order_no_value);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived the orders history!", {
            orders,
            total_orders,
            total_pages,
            current_page: current_page || 1,
            limit: limit || 10
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

}

const companyController = new CompanyControllerClass();
export default companyController;
