#!/usr/bin/env node
import { Meta, param, ValidationChain, body, query } from "express-validator";
import { companyService, CompanyServiceClass } from "./company.service";
import { User } from "../../../generated/prisma";




class CompanyValidatorClass {
   private service: CompanyServiceClass;

   constructor(service: CompanyServiceClass) {
      this.service = service;
   }

   public companyParamIDValidDB = (): ValidationChain[] => ([
      param("company_id")
         .trim().notEmpty().withMessage("Company ID is Required!")
         .isUUID().withMessage("Invalid ID!")
         .isLength({ min: 5, max: 55 }).withMessage("Invalid ID!")
         .custom(async (val: string, { req }: Meta): Promise<boolean | void> => {
            try {
               const company = await this.service.getCompanyByID(val);

               if (!company) {
                  (req as any).status_code = 404;
                  throw (new Error("Invalid Company ID!"));
               }

               (req as any).company = company
               return (true);
            } catch (err) {
               throw (err);
            }
         }),
   ])

}

const companyValidator = new CompanyValidatorClass(companyService);
export { companyValidator, CompanyValidatorClass };
