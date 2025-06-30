#!/usr/bin/env node
import { body, Meta, param, query, ValidationChain } from "express-validator";
import adminCategoryService from "./category.service";




class AdminCategoryValidationClass {
   private service;

   constructor () {
      this.service = adminCategoryService;
   }

   public createCategoryValid = (): ValidationChain[] => ([
      body("level")
         .isNumeric().withMessage("lvl must be a digit that explain the lvl of category in hierarchy!"),
      body("website_name")
         .trim().notEmpty().withMessage("Category website Name is Required!"),
      body("category_name")
         .trim().notEmpty().withMessage("Category Name is Required!")
         .isLength({ min: 3, max: 70 }).withMessage("Category name must between 5 and 70 characters")
         .custom( async (val: string, { req }: Meta): Promise<boolean | void> => {
            try {
               const familiarCategory = await this.service.findFamiliarCategory(val);

               if (familiarCategory)
                  throw (new Error("You have this category with this name!"));

               return (true);
            } catch (err) {
               throw (err);
            }
         }),
      body("parent_id")
         .trim().notEmpty().withMessage("Its Parent Category is required!")
         .isUUID().withMessage("Parent Category ID must be a valid UUID!")
         .optional({ nullable: true })
         .isLength({ min: 5, max: 55 }).withMessage("Parent category id must between 5 and 55 characters")
         .custom((val: string, { req }: Meta) => {
            if (req.body.lvl === 0)
               throw (new Error("This Category Level Represent as Base Level!"));

            if (val.length > 50)
               throw (new Error("In valid category id!"));

            return (true);
         })
   ]);


   public categoryListPaginationValid = (): ValidationChain[] => ([
      query("page")
         .optional()
         .isInt({ min: 1 }).withMessage("Not valid pagination, please follow the pagination rules!"),
      query("limit")
         .optional()
         .isInt({ min: 1, max: 100 }).withMessage("Not valid pagination, please follow the pagination rules!"),
      query("level")
         .optional()
         .isInt({ min: 0, max: 3 }).withMessage("Not valid pagination, please follow the pagination rules!"),
   ])
}

const adminCategoryValidation = new AdminCategoryValidationClass();
export default adminCategoryValidation;
