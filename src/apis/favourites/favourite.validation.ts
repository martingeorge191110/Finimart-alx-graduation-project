import { body, Meta, param, ValidationChain } from "express-validator";
import FavouriteServiceClass from "./favourite.service";




class FavouriteValidationClass {
   private service;

   constructor () {
      this.service = FavouriteServiceClass.getInstance();
   }

   public static getInstance = () => new FavouriteValidationClass();

   public newFavouriteValid = (): ValidationChain[] => ([
      body("product_id")
         .trim().notEmpty().withMessage("Product ID is required")
         .isUUID().withMessage("Product ID must be a valid UUID")
         .bail()
         .custom(async (val: string, { req }: Meta) => {
            try {
               const product = await this.service.getProduct(val);
               if (!product)
                  throw new Error("Product not found");

               req.product = product;
               return (val);
            } catch (err) {
               throw (err);
            }
         })
   ])

   public favoruitesPaginatedValid = (): ValidationChain[] => ([
      param("page")
         .optional().isInt({ min: 1 }).withMessage("Page must be a positive integer")
         .toInt(),
      param("limit")
         .optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100")
         .toInt()
   ])

   public deleteFavouriteValid = (): ValidationChain[] => ([
      param("id")
         .trim().notEmpty().withMessage("Favourite ID is required")
         .isUUID().withMessage("Favourite ID must be a valid UUID")
         .bail()
         .custom(async (val: string, { req }: Meta) => {
            try {
               const favourite = await this.service.getFavouriteByID(val);
               if (!favourite)
                  throw new Error("Favourite not found");

               req.favourite = favourite;
               return (true);
            } catch (err) {
               throw (err);
            }
         })
   ])
}

export default FavouriteValidationClass;
