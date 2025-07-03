#!/usr/bin/env node
import { body, Meta, query, ValidationChain } from "express-validator";
import { CompanyValidatorClass } from "../../company/company.validator";
import { companyService } from "../../company/company.service";


class AdminCompanyValidatorClass extends CompanyValidatorClass {

   public companyListFilterationValid = (): ValidationChain[] => ([
      query("page")
         .optional()
         .isInt({ min: 1 }).withMessage("Not valid pagination, please follow the pagination rules!"),
      query("limit")
         .optional()
         .isInt({ min: 1, max: 20 }).withMessage("Not valid pagination, please follow the pagination rules!"),
      query("verified")
         .optional()
         .isIn(["true", "false"]).withMessage("Verified must be 'true' or 'false'"),
      query("city")
         .optional()
         .isString().withMessage("Not valid city, please follow the rules!"),
      query("country")
         .optional()
         .isString().withMessage("Not valid country, please follow the rules!")
         .isLength({ min: 2, max: 50 }).withMessage("Invalid country name!"),
      query("min_amount_purcahsed")
         .optional()
         .isInt({ min: 0 }).withMessage("Not valid minimum amount purchased, please follow the rules!"),
      query("max_amount_purcahsed")
         .optional()
         .isInt({ min: 0 }).withMessage("Not valid maximum amount purchased, please follow the rules!"),
      query("sort_by")
         .optional()
         .isIn(["created_at", "updated_at", "total_amount_purchased", "name"]).withMessage("Not valid sort by, please follow the rules!"),
      query().custom((value, { req }: Meta) => {
         const min = Number((req.query as any).min_amount_purchased);
         const max = Number((req.query as any).max_amount_purchased);
         if (!isNaN(min) && !isNaN(max) && min > max) {
            throw new Error("min_amount_purchased should be less than or equal to max_amount_purchased");
         }
         return (true);
      }),
   ])
}

const adminCompanyValidator = new AdminCompanyValidatorClass(companyService);
export default adminCompanyValidator;
