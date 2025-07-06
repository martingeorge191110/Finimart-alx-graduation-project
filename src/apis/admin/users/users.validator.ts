#!/usr/bin/env node

import { body, Meta, param, query, ValidationChain } from "express-validator";
import AdminUsersService from "./users.service";



class AdminUsersValidatorClass {
   private service;

   constructor () {
      this.service = AdminUsersService;
   }

   public getUsersPaginationValid = (): ValidationChain[] => ([
      query("page")
         .optional()
         .isInt({ min: 1 }).withMessage("Not valid pagination, please follow the pagination rules!"),
      query("limit")
         .optional()
         .isInt({ min: 1, max: 100 }).withMessage("Not valid pagination, please follow the pagination rules!"),
      query("search_by_company_name")
         .optional()
         .isString().withMessage("Search query must be a string!")
         .isLength({ min: 1, max: 100 }).withMessage("Search query must be between 1 and 100 characters!"),
      query("is_super_user")
         .optional()
         .isBoolean().withMessage("is_super_user must be a boolean value!")
         .toBoolean(),
      query("created_at")
         .optional()
         .isISO8601().withMessage("created_at must be a valid ISO 8601 date string!")
         .toDate()
   ])

   public userIDParamValid = (): ValidationChain[] => ([
      param("user_id")
         .trim().notEmpty().withMessage("User ID is required!")
         .isUUID().withMessage("User ID must be a valid UUID!")
         .custom(async (val: string, { req }: Meta): Promise<boolean | void> => {
            try {
               const user = await this.service.getUserById(val);
               if (!user) {
                  (req as any).status_code = 404;
                  throw (new Error("User not found!"));
               }

               (req as any).user = user;
               return (true);
            } catch (err) {
               throw (err);
            }
         })
   ])

   public updateUserValid = (): ValidationChain[] => ([
      body("first_name")
         .optional()
         .isString().withMessage("First name not added")
         .isLength({ min: 1, max: 20 }).withMessage("First name must be between 1 and 20 characters."),
      body("last_name")
         .optional()
         .isString().withMessage("Last name not added.")
         .isLength({ min: 1, max: 20 }).withMessage("Last name must be between 1 and 20 characters."),
      body("email")
         .optional()
         .isEmail().withMessage("Email must be a valid email address.")
         .normalizeEmail(),
      body("phone_number")
         .optional()
         .isString().withMessage("Phone number not added")
         .isLength({ min: 5, max: 20 }).withMessage("Phone number must be between 5 and 20 characters."),
      body("is_super_user")
         .optional()
         .isBoolean().withMessage("is_super_user must be a boolean.")
         .toBoolean(),
      body("user_role")
         .optional()
         .isString().withMessage("user_role must be a string.")
         .isIn(["Controller", "Sub_Controller", "Order_Maker"]).withMessage("Invalid user_role provided.")
   ])
}

const AdminUsersValidator = new AdminUsersValidatorClass();
export default AdminUsersValidator;
