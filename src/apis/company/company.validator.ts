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

   public valdiateOrderNumber = (): ValidationChain[] => ([
      query("order_no")
         .optional()
         .isNumeric().withMessage("Order Number must be a number!")
         .isInt({ min: 1 }).withMessage("Order Number must be greater than 0!")
   ])

   public validatePagination = (): ValidationChain[] => ([
      query("page")
         .optional()
         .isNumeric().withMessage("Page must be a number!")
         .isInt({ min: 1 }).withMessage("Page must be greater than 0!"),
      query("limit")
         .optional()
         .isNumeric().withMessage("Limit must be a number!")
         .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100!")
   ])

   public validateOrdersList = (): ValidationChain[] => ([
      ...this.valdiateOrderNumber(),
      ...this.validatePagination(),
   ])

   public validateCreateUser = (): ValidationChain[] => ([
      body("first_name")
         .trim().notEmpty().withMessage("First name is required")
         .isLength({ min: 3, max: 50 }).withMessage("First name must be between 3 and 50 characters"),
      body("last_name")
         .trim().notEmpty().withMessage("Last name is required")
         .isLength({ min: 3, max: 50 }).withMessage("Last name must be between 3 and 50 characters"),
      body("email")
         .trim().notEmpty().withMessage("Email is required")
         .isEmail().withMessage("Email is invalid")
         .isLength({ min: 10, max: 200 }).withMessage("Email must be between 1 and 200 characters")
         .bail()
         .custom(async (val: string, { req }: Meta): Promise<void | boolean> => {
            const user: (User | null) = await this.service.getUserByEmail(val);

            if (user)
               throw (new Error("Email already exists"));

            return (true);
         }),
      body("password")
         .trim().notEmpty().withMessage("Password is required")
         .isLength({ min: 8, max: 200 }).withMessage("Password must be between 8 and 200 characters"),
      body("confirm_password")
         .trim().notEmpty().withMessage("Confirm password is required")
         .isLength({ min: 8, max: 200 }).withMessage("Confirm password must be between 8 and 200 characters")
         .custom((val: string, { req }: Meta): void | boolean => {
            if (val !== (req as any).body.password) {
               throw (new Error("Passwords do not match"));
            }
            return (true);
         }),
      body("phone_number")
         .trim().notEmpty().withMessage("Phone number is required")
         .isMobilePhone("ar-EG").withMessage("Phone number is invalid")
         .isLength({ min: 10, max: 15 }).withMessage("Phone number must be between 10 and 15 characters")
         .bail()
         .custom(async (val: string, { req }: Meta): Promise<void | boolean> => {
            try {
               const user = await this.service.getUserByPhoneNumber(val);
               if (user)
                  throw (new Error("Phone number already exists"));

               return (true);
            } catch (err) {
               throw (err);
            }
         }),
      body('role')
         .trim().notEmpty().withMessage("Role is required")
         .isIn(["Controller", "Sub_Controller", "Order_Maker"]).withMessage("Role must be one of the following: Controller, Sub_Controller, Order_Maker")
   ])

   public validateUserID = (): ValidationChain[] => ([
      param("user_id")
         .trim().notEmpty().withMessage("User ID is Required!")
         .isUUID().withMessage("Not valid User ID!")
         .bail()
         .custom(async (val: string, { req }: Meta) => {
            try {
               const user = await this.service.getUserByID(val);
               if (!user)
                  throw (new Error("User not found!"));

               (req as any).user = user;
               return (true);
            } catch (err) {
               throw (err);
            }
         })
   ])

   public validateUserRole = (): ValidationChain[] => ([
      ...this.validateUserID(),
      body("user_role")
         .trim().notEmpty().withMessage("User role is required")
         .isIn(["Controller", "Sub_Controller", "Order_Maker"]).withMessage("User role must be one of the following: Controller, Sub_Controller, Order_Maker")
   ])

}

const companyValidator = new CompanyValidatorClass(companyService);
export { companyValidator, CompanyValidatorClass };
