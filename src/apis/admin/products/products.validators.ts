#!/usr/bin/env node
import { body, Meta, param, query, ValidationChain } from "express-validator";
import adminProductService from "./prodcuts.service";
import { validate } from "node-cron";



class AdminProductValidatorClass {
   private service;

   constructor() {
      this.service = adminProductService;
   }

   public productsPaginationValid = (): ValidationChain[] => ([
      query("page")
         .optional()
         .isInt({ min: 1 }).withMessage("Not valid pagination, please follow the pagination rules!"),
      query("limit")
         .optional()
         .isInt({ min: 1, max: 100 }).withMessage("Not valid pagination, please follow the pagination rules!"),
      query("search_by_code")
         .optional()
         .isString().withMessage("Product code must be string!"),
      query("is_active")
         .optional()
         .isBoolean().withMessage("is_super_user must be a boolean value!")
   ])

   public createProductValidation = (): ValidationChain[] => ([
      body("product_title")
         .trim().notEmpty().withMessage("Product Title is Required!")
         .isLength({ min: 5, max: 100 }).withMessage("In valid product title!")
         .custom(async (val: string, { req }: Meta): Promise<Boolean | void> => {
            try {
               const find_product = await this.service.findProductByTitle(val);

               if (find_product)
                  throw (new Error("This Product title is already exists!"));

               return (true);
            } catch (err) {
               throw (err);
            }
         }),
      body("description")
         .trim().notEmpty().withMessage("Product Description is Required!")
         .isLength({ min: 5, max: 255 }).withMessage("In valid product description"),
      body("product_code")
         .trim().notEmpty().withMessage("Product Code is Required!")
         .isLength({ min: 5, max: 100 }).withMessage("In valid product Code!")
         .custom(async (val: string, { req }: Meta): Promise<boolean | void> => {
            try {
               if (await this.service.findProductByCode(val))
                  throw (new Error("In Valid Product Code!"))

               return (true);
            } catch (err) {
               throw (err);
            }
         }),
      body("color")
         .optional()
         .isLength({ min: 3, max: 55 }).withMessage("In valid product color!"),
      body("quantity")
         .custom((val: (string | number | any), { req }: Meta) => {
            if (isNaN(Number(val)))
               throw (new Error("Invalid Quantity input!"));

            return (true)
         }),
      body("price_range")
         .trim().notEmpty().withMessage("Product Price Range is Required!")
         .isIn(["Economic", "Medium", "Expensive"]).withMessage("In valid Price Range!"),
      body("brand_id")
         .trim().notEmpty().withMessage("Brand ID is Required!")
         .isUUID().withMessage("Invalid Brand ID!")
         .isLength({ min: 5, max: 55 }).withMessage("In valid Brand ID!")
         .custom(async (val: string, { req }: Meta) => {
            try {
               const brand_db = await this.service.getBrandByIdDB(val);

               if (!brand_db) {
                  (req as any).status_code = 404;
                  throw (new Error("Brand is not Found!"));
               }

               (req as any).brand = brand_db;
               return (true);
            } catch (err) {
               throw (err);
            }
         }),
      body("category_id")
         .trim().notEmpty().withMessage("Category ID is Required!")
         .isUUID().withMessage("Invalid Category ID!")
         .custom(async (val: string, { req }: Meta) => {
            try {
               const category = await this.service.getCategoryByID(val);

               if (!category) {
                  (req as any).status_code = 404;
                  throw (new Error("Invalid Category ID!"));
               }

               (req as any).category = category
               return (true);
            } catch (err) {
               throw (err);
            }
         })
   ])

   public updatePorductValid = (): ValidationChain[] => ([
      body("product_title")
         .optional()
         .isLength({ min: 5, max: 100 }).withMessage("In valid product title!")
         .custom(async (val: string, { req }: Meta) => {
            try {
               const productId = req.params?.product_id;
               const find_product = await this.service.findProductByTitle(val);
               
               if (find_product && find_product.id !== productId) {
                  throw new Error("This product title already exists!");
               }
               

               return (true);
            } catch (err) {
               throw (err);
            }
         }),
      body("description")
         .optional()
         .isLength({ min: 5, max: 255 }).withMessage("In valid product description"),
      body("product_code")
         .optional()
         .isLength({ min: 5, max: 100 }).withMessage("In valid product code!")
         .custom(async (val: string, { req }: Meta) => {
            const productId = req.params?.product_id;

            const existingProduct = await this.service.findProductByCode(val);
            console.log("existingProduct", existingProduct?.id, productId);
            if (existingProduct && existingProduct.id !== productId) {
               throw new Error("This product code already exists!");
            }

            return true;
                  }),
      body("color")
         .optional()
         .isLength({ min: 3, max: 55 }).withMessage("In valid product color!"),
      body("quantity")
         .optional()
         .custom((val: (string | number | any), { req }: Meta) => {
            if (isNaN(Number(val)))
               throw (new Error("Invalid Quantity input!"));

            return (true);
         }),
      body("price_range")
         .optional()
         .isIn(["Economic", "Medium", "Expensive"]).withMessage("In valid Price Range!"),
      body("brand_id")
         .optional()
         .isUUID().withMessage("Invalid Brand ID!")
         .isLength({ min: 5, max: 55 }).withMessage("In valid Brand ID!")
         .custom(async (val: string, { req }: Meta) => {
            try {
               const brand_db = await this.service.getBrandByIdDB(val);

               if (!brand_db) {
                  (req as any).status_code = 404;
                  throw (new Error("Brand is not Found!"));
               }

               (req as any).brand = brand_db;
               return (true);
            } catch (err) {
               throw (err);
            }
         }),
      body("category_id")
         .optional()
         .isUUID().withMessage("Invalid Category ID!")
         .custom(async (val: string, { req }: Meta) => {
            try {
               const category = await this.service.getCategoryByID(val);

               if (!category) {
                  (req as any).status_code = 404;
                  throw (new Error("Invalid Category ID!"));
               }

               (req as any).category = category
               return (true);
            } catch (err) {
               throw (err);
            }
         })
   ])

   public addProductVariant = (): ValidationChain[] => ([
      body("size")
         .trim().notEmpty().withMessage("Size is Required!")
         .isLength({ max: 10 }).withMessage("Invalid size input!"),
      body("price")
         .isNumeric().withMessage("Invalid Price input!"),
      body("quantity")
         .toInt()
         .isInt().withMessage("Invalid quantity input!")
   ])

   public updateProductVariantValid = (): ValidationChain[] => ([
      body("size")
         .optional()
         .trim().notEmpty().withMessage("Size is Required!")
         .isLength({ max: 10 }).withMessage("Invalid size input!"),
      body("price")
         .optional()
         .isNumeric().withMessage("Invalid Price input!"),
      body("quantity")
         .optional()
         .isInt().withMessage("Invalid quantity input!")
   ])

   public removeOrAddCategoryToProduct = (): ValidationChain[] => ([
      body("category_id")
         .trim().notEmpty().withMessage("Category ID is Required!")
         .isUUID().withMessage("Invalid Category ID!")
         .custom(async (val: string, { req }: Meta): Promise<boolean | void> => {
            try {
               const category = await this.service.getCategoryByID(val);

               if (!category) {
                  (req as any).status_code = 404;
                  throw (new Error("Invalid Category!"));
               }

               (req as any).category = category;
               return (true);
            } catch (err) {
               throw (err);
            }
         })
   ])

   public activeProductValid = (): ValidationChain[] => ([
      body("active")
         .notEmpty().withMessage("active status is required!")
         .custom((val, { req }: Meta) => {
            if (typeof val !== 'boolean')
               throw (new Error("Active status should be boolean!"))

            return (true);
         })
         .isBoolean().withMessage("Active status should be boolean!")
   ])

   public specsAndProductIDValid = (): ValidationChain[] => ([
      param("product_id")
         .trim().notEmpty().withMessage("Product ID is required!")
         .isUUID().withMessage("Invalid Product ID!")
         .isLength({ min: 5, max: 55 }).withMessage("Invalid Product ID!"),
      param("specs_id")
         .trim().notEmpty().withMessage("Specs ID is required!")
         .isUUID().withMessage("Invalid Specs ID!")
         .isLength({ min: 5, max: 55 }).withMessage("Invalid Specs ID!")
   ])

   public addOrUpdateSpecsValueValid = (): ValidationChain[] => ([
      ...this.specsAndProductIDValid(),
      body("value")
         .trim().notEmpty().withMessage("Specs value is required!")
         .isString().withMessage("Specs value must be string!")
         .isLength({ min: 1, max: 15 }).withMessage("Invalid Specs value!"),
   ])

   public productParamValidID = (): ValidationChain[] => ([
      param("product_id")
         .trim().notEmpty().withMessage("Product id is Required in Params!")
         .isUUID().withMessage("No valid ID")
         .isLength({ min: 5, max: 50 }).withMessage("Product id should be between 5 and 50 charachters!")
   ])

   public productAndVariantIDsValid = (): ValidationChain[] => ([
      ...this.productParamValidID(),
      param("variant_id")
         .trim().notEmpty().withMessage("Variant id is Required in Params!")
         .isUUID().withMessage("No valid ID")
         .isLength({ min: 5, max: 50 }).withMessage("Variant id should be between 5 and 50 charachters!")
   ])
}

const adminProductValidator = new AdminProductValidatorClass();
export default adminProductValidator;
