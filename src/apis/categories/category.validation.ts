import { Meta, param, ValidationChain } from "express-validator";




class CategoryValidation {

   public static getInstance = () => new CategoryValidation();

   public validateCategoryId = (): ValidationChain[] => ([
      param('category_id')
         .trim().notEmpty().withMessage("Category ID is required")
         .isUUID().withMessage("Category ID must be a string")
   ])

   public validatePagination = (): ValidationChain[] => ([
      param('page')
         .optional()
         .isInt({ min: 1 }).withMessage("Page must be a number greater than 0")
         .toInt(),

      param('limit')
         .optional()
         .isInt({ min: 1, max: 100 }).withMessage("Limit must be a number between 1 and 100")
         .toInt()
   ])

   public validateProductsCategory = (): ValidationChain[] => ([
      ...this.validateCategoryId(),
      ...this.validatePagination()
   ])
}

export default CategoryValidation;
