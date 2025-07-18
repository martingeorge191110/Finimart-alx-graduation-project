#!/usr/bin/env node
import { body, Meta, query, ValidationChain } from "express-validator";
import { CompanyValidatorClass } from "../../company/company.validator";
import { companyService } from "../../company/company.service";


class AdminCompanyValidatorClass extends CompanyValidatorClass {

   public blockCompanyAccValid = (): ValidationChain[] => ([
      ...this.companyParamIDValidDB(),
      body("block")
         .isBoolean().withMessage("Invalid Block input!")
   ])

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

   public updateCompanyWalletValid = (): ValidationChain[] => (
      console.log("updateCompanyWalletValid"),
      [
      ...this.companyParamIDValidDB(),
      body("amount")
         .isInt({ min: 100 }).withMessage("Not valid amount, please follow the rules!"),
      body("type")
         .isIn(["add", "subtract"]).withMessage("Not valid type, please follow the rules!")
   ])

   public getAllCompanyWalletsValidWithFilter = (): ValidationChain[] => [
      query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Not valid pagination, please follow the pagination rules!"),
      query("limit")
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage("Not valid pagination, please follow the pagination rules!"),
      query("min_balance")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("min_balance must be a positive number"),
      query("max_balance")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("max_balance must be a positive number"),
      query().custom((value, { req }: Meta) => {
         // Validate logical relationship between min_balance and max_balance
         // Prevent misuse or injection by ensuring min <= max if both are provided
         const min = Number((req.query as any).min_balance);
         const max = Number((req.query as any).min_balance);
         if (!isNaN(min) && !isNaN(max) && min > max) {
            throw new Error("min_balance must be less than or equal to max_balance");
         }
         return true;
      }),
   ];
}

const adminCompanyValidator = new AdminCompanyValidatorClass(companyService);
export default adminCompanyValidator;
