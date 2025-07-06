#!/usr/bin/env node

import { body, param, query, ValidationChain } from "express-validator";



class AdminOrdersValidatorClass {


   public static createInstance = () => (new AdminOrdersValidatorClass());

   public ordersPaginationValid = (): ValidationChain[] => ([
      query("page")
         .optional()
         .isInt({ min: 1 }).withMessage("Not valid pagination, please follow the pagination rules!"),
      query("limit")
         .optional()
         .isInt({ min: 1, max: 100 }).withMessage("Not valid pagination, please follow the pagination rules!"),
      query("search_by_company")
         .optional()
         .isString().withMessage("Search query must be a string!")
         .isLength({ min: 1, max: 100 }).withMessage("Search query must be between 1 and 100 characters!"),
      query("order_by")
         .optional()
         .isIn(["desc", "esc"]).withMessage("Invalid order_by options"),
      query("created_at")
         .optional()
         .isISO8601().withMessage("created_at must be a valid ISO 8601 date string!")
         .toDate(),
      query("status")
         .optional()
         .isIn(['Pending', 'Confirmed', 'Cancelled', 'Returned']).withMessage("Invalid Status option!")
   ])
}

const adminOrderValidator = AdminOrdersValidatorClass.createInstance();
export default adminOrderValidator;
