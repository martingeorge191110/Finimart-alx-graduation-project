import { body, Meta, query, ValidationChain } from "express-validator";
import CartService from "./cart.service";




class CartValidation {
   private service;

   constructor() {
      this.service = CartService.getInstance();
   }

   public static getInstance = () => new CartValidation();

   public validateCartItem = (): ValidationChain[] => ([
      body('product_id')
         .trim().notEmpty().withMessage('Product ID is required')
         .isUUID().withMessage('Product ID must be a valid UUID')
         .bail()
         .custom(async (val: string, { req }: Meta) => {
            try {
               const item = await this.service.getProductByID(val);
               if (!item)
                  throw new Error('Product not found');

               (req as any).product = item;
               return (true);
            } catch (err) {
               throw (err);
            }
         }),
      body('quantity')
         .optional()
         .isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
      body("product_variant_id")
         .optional()
         .trim().notEmpty().withMessage('Product variant ID is required')
         .isUUID().withMessage('Product variant ID must be a valid UUID')
         .bail()
   ])

   public validateGetCartItems = (): ValidationChain[] => ([
      query('page')
         .optional()
         .isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
      query('limit')
         .optional()
         .isInt({ gt: 0, lt: 100 }).withMessage('Limit must be a positive integer less than 100')
   ])

   public validateItemID = (): ValidationChain[] => ([
      body('cart_item_id')
         .trim().notEmpty().withMessage('Item ID is required')
         .isUUID().withMessage('Item ID must be a valid UUID')
         .bail()
         .custom(async (val: string, { req }: Meta) => {
            try {
               const item = await this.service.getCartItemByID(val);
               if (!item)
                  throw new Error('Cart item not found');

               (req as any).cart_item = item;
               return (true);
            } catch (err) {
               throw (err);
            }
         })
   ])

   public validateUpdateCartItem = (): ValidationChain[] => ([
      ...this.validateItemID(),
      body('type')
         .trim().notEmpty().withMessage('Type is required')
         .isIn(['increment', 'decrement']).withMessage('Type must be either "increment" or "decrement"'),
   ])
}

export default CartValidation;