#!/usr/bin/env node

import { query, ValidationChain } from "express-validator";



class AdminInvoicesValidatorClass {


    public static createInstance = () => (new AdminInvoicesValidatorClass());

    public getAllInvoicesValidator = (): ValidationChain[] => [
    
        query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Not valid pagination, please follow the pagination rules!")
        .toInt(),

        query("limit")
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage("Not valid pagination, please follow the pagination rules!")
        .toInt(),

        query("order_no")
        .optional()
        .isInt()
        .withMessage("Order number must be a valid integer")
        .toInt(),

        query("search")
        .optional()
        .isString()
        .withMessage("Search must be a valid search"),

        query("startDate")
        .optional()
        .isISO8601()
        .withMessage("StartDate must be a valid date"),

        query("endDate")
        .optional()
        .isISO8601()
        .withMessage("EndDate must be a valid date"),

        query("sort")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort must be clear"),
    ];
}

const AdminInvoicesValidator = AdminInvoicesValidatorClass.createInstance();
export default AdminInvoicesValidator;
