#!/usr/bin/env node

import { body, param, ValidationChain } from "express-validator";



class AdminSpecsValidatorClass {

   constructor() {

   }


   public static createInstance = () => (new AdminSpecsValidatorClass())

   public addNewSpecsValid = (): ValidationChain[] => ([
      body('key_name')
         .trim().notEmpty().withMessage("Key Name is Required!")
         .isString().withMessage("Not valid key name")
         .isLength({ min: 3, max: 55 }).withMessage("not valid key name"),
      body("unit")
         .trim().notEmpty().withMessage("Unit is Required!")
         .isString().withMessage("Not valid unit")
         .isLength({ min: 1, max: 55 }).withMessage("not valid unit"),
   ])

   public updateSpecsValid = (): ValidationChain[] => ([
      param("specs_id")
         .trim().notEmpty().withMessage("Specs ID is Required!")
         .isUUID().withMessage("Invalid Specs ID"),
      body("key_name")
         .optional()
         .isString().withMessage("Not valid key name")
         .isLength({ min: 3, max: 55 }).withMessage("not valid key name"),
      body("unit")
         .optional()
         .isString().withMessage("Not valid unit")
         .isLength({ min: 1, max: 55 }).withMessage("not valid Unit")
   ])

   public deleteSpecsValid = (): ValidationChain[] => ([
      param("specs_id")
         .trim().notEmpty().withMessage("Specs ID is required")
         .isUUID().withMessage("Invalid Specs ID format")
   ]);
}

const adminSpecsValidator = AdminSpecsValidatorClass.createInstance();
export default adminSpecsValidator;
