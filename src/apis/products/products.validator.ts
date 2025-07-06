#!/usr/bin/env node
import { body, Meta, param, query, ValidationChain } from "express-validator";
import productService from "./products.services";
import { validate as isUUID } from "uuid";



class ProductValidatorClass {
   private serivces;

   constructor () {
      this.serivces = productService;
   }
   

   public productParamValidID = (): ValidationChain[] => ([
      param("product_id")
         .trim().notEmpty().withMessage("Product id is Required in Params!")
         .isUUID().withMessage("No valid ID")
         .isLength({ min: 5, max: 50 }).withMessage("Product id should be between 5 and 50 charachters!")
   ])

   public productSearchValid = (): ValidationChain[] => ([
      query("search")
         .optional().trim().notEmpty().withMessage("Search query is Required!")
         .isString().withMessage("Search query should be a string!")
         .isLength({ min: 3, max: 50 }).withMessage("Search query should be between 3 and 50 charachters!"),
      query("root")
         .optional().trim().notEmpty().withMessage("Root query is Required!")
         .custom((val: string, { req }: Meta) => {
            if (val !== "all" && !isUUID(val))
               throw new Error("Root query should be 'all' or a valid UUID!");

            return (true);
         })
   ])

   public getFilteredProductsValid = (): ValidationChain[] => ([
      query("root_id")
            .optional()
            .isUUID().withMessage("root_id must be a valid UUID."),

         query("lvl1")
            .optional()
            .isUUID().withMessage("lvl1 must be a valid UUID."),

         query("lvl2")
            .optional()
            .isUUID().withMessage("lvl2 must be a valid UUID."),

         // Brand filter (can be null as string)
         query("brand")
            .optional()
            .customSanitizer(value => value === "null" ? null : value)
            .isUUID().withMessage("brand must be a valid UUID.")
            .optional({ nullable: true }),

         // Price range label
         query("price_range")
            .optional()
            .isString().withMessage("price_range must be a string."),

         // Min & max price
         query("minPriceRange")
            .optional()
            .isFloat({ min: 0 }).withMessage("minPriceRange must be a non-negative number.")
            .toFloat(),

         query("maxPriceRange")
            .optional()
            .isFloat({ min: 0 }).withMessage("maxPriceRange must be a non-negative number.")
            .toFloat()
   ])
}

const productValidator = new ProductValidatorClass();
export default productValidator;
