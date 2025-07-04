#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import ApiError from "../../../middlewares/error.handler";
import globalUtils from "../../../utils/globals";
import { Company } from "../../../../generated/prisma";
import adminUtilies from "../admin.utilies";
import adminCompanyService from "./company.service";
import { getTemporaryPDFUrl } from "../../../middlewares/cloudinary";




class AdminCompanyControllerClass {
   private service;

   constructor () {
      this.service = adminCompanyService;
   }

   public VerifyCompanyAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).company;
      const { verified } = req.body;

      try {
         if (verified === "accept") {
            const updated_company = await this.service.updateCompanyData(company.id, { verified: true });
            await this.service.updateCompanyInRedis(updated_company);
            await this.service.updateCompanyWallet(company.id, 0, "add");
            return globalUtils.SuccessfulyResponseJson(res, 200, "Successfully Verified the Company", { ...updated_company });
         }

         if (verified === "rejected") {
            await this.service.deleteCompanyByID(company.id);
            return globalUtils.SuccessfulyResponseJson(res, 200, "Company Rejected and Deleted Successfully", {});
         }

         return next(ApiError.create_error("Invalid 'verified' value. Must be 'accept' or 'rejected'", 400));
      } catch (err) {
         return next(ApiError.create_error(String(err), 500));
      }
   };

   public CompaniesList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { page, limit, verified, city, country, min_amount_purcahsed, max_amount_purcahsed, sort_by } = req.query;

      const page_number = Number(page) || 1;
      const limit_number = Number(limit) || 20;
      const sort_by_query = sort_by ? String(sort_by) : 'created_at'


      const filteration: any = {
         verified: verified ? verified == "true" : undefined,
         city: city ? String(city) : undefined,
         country: country ? String(country) : undefined,
         min_amount_purcahsed: min_amount_purcahsed ? Number(min_amount_purcahsed) : undefined,
         max_amount_purcahsed: max_amount_purcahsed ? Number(max_amount_purcahsed) : undefined,
      };

      console.log(filteration, verified, typeof verified)

      try {
         const companies = await this.service.getCompaniesFiltered(page_number, limit_number, sort_by_query, filteration);

         const total_companies = await this.service.getTotalCompaniesFiltered(filteration);
         const total_pages = Math.ceil(total_companies / limit_number);
         const has_next_page = page_number < total_pages;
         const has_previous_page = page_number > 1;
         
         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly Retreived the Companies List", {
            companies, total_companies, total_pages, has_next_page, has_previous_page
         }))
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }




}

const adminCompanyController = new AdminCompanyControllerClass();
export default adminCompanyController;
