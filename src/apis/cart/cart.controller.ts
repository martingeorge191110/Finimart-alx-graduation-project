import { NextFunction, Request, Response } from "express";
import CartService from "./cart.service";
import { JWT_PAYLOAD } from "../../types/express";
import { Cart_items, Product } from "../../../generated/prisma";
import ApiError from "../../middlewares/error.handler";
import globalUtils from "../../utilies/globals";





class CartController {
   private service;
   private MAX_ITEMS_IN_CART = 30;

   constructor() {
      this.service = CartService.getInstance();
   }

   public static getInstance = () => new CartController();

   public AddCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: JWT_PAYLOAD = (req as any).payload;
      const product: Product = (req as any).product;
      const { product_variant_id } = req.body;
      const { quantity } = req.body;
      const quantityValue: number = quantity && typeof quantity === "number" ? quantity : 1;

      if (product.quantity < quantityValue)
         return (next(ApiError.create_error("Insufficient product quantity", 400)));

      try {
         const cartItemsCount = await this.service.countCartItemsPerCompany(payload.company_id);
         if (cartItemsCount >= this.MAX_ITEMS_IN_CART)
            return (next(ApiError.create_error(`Cannot add more than ${this.MAX_ITEMS_IN_CART} items to the cart`, 400)));

         const variant = await this.service.getProductVariantByID(product_variant_id);

         const isInCart = await this.service.checkCart(payload.company_id, product.id, variant?.id);
         if (isInCart)
            return (next(ApiError.create_error("Product with same variant already in cart", 400)));

         const item = await this.service.addCartItem(
            { created_by_id: payload.user_id, company_id: payload.company_id }, product.id, variant?.id, quantityValue
         );

         // Delete the cache after adding new items
         await this.service.deleteCompanyCartCache(payload.company_id);

         return (globalUtils.SuccessfulyResponseJson(res, 201, "Cart item added successfully", {
            ...item
         }))
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetCartItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { page, limit } = req.query;
      const payload: JWT_PAYLOAD = (req as any).payload;
      const pageValue: number = page && typeof page === "string" ? parseInt(page) : 1;
      const limitValue: number = limit && typeof limit === "string" ? parseInt(limit) : 10;

      try {
         if (pageValue === 1 && limitValue === 10) {
            const cachedData = await this.service.getCompanyGetCartItemsCache(payload.company_id, pageValue);
            if (cachedData) {
               return (globalUtils.SuccessfulyResponseJson(res, 200, "Cart items fetched successfully", {
                  ...JSON.parse(cachedData)
               }));
            }
         }

         const {
            items, total_items, total_pages, current_page, has_next_page, has_previous_page
         } = await this.service.cartItems(payload.company_id, pageValue, limitValue);

         if (pageValue === 1 && limitValue === 10)
            await this.service.setCompanyGetCartItemsCache(
               payload.company_id, items, total_items, total_pages, current_page, has_next_page, has_previous_page
            )

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Cart items fetched successfully", {
            items, total_items, total_pages, current_page, has_next_page, has_previous_page
         }))
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public DeleteCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: JWT_PAYLOAD = (req as any).payload;
      const item: Cart_items = (req as any).cart_item;

      try {
         if (item.company_id !== payload.company_id)
            return (next(ApiError.create_error("You do not have permission to delete this cart item", 403)));

         // Delete the cache after deleting an item
         await Promise.all([
            this.service.deleteCompanyCartCache(payload.company_id),
            this.service.deleteItemFromCart(item.id, payload.company_id)
         ]);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Cart item deleted successfully", {
            ...item
         }))
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public UpdateCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: JWT_PAYLOAD = (req as any).payload;
      const item: Cart_items = (req as any).cart_item;
      const { type } = req.body;

      if (item.company_id !== payload.company_id)
         return (next(ApiError.create_error("You do not have permission to update this cart item", 403)));

      if (item.quantity <= 1 && type === "decrement")
         return (next(ApiError.create_error("Cannot decrement quantity below 1", 400)));

      try {
         const product = await this.service.getProductWithVariantByID(item.product_id, item.product_variant_id);
         if (!product)
            return (next(ApiError.create_error("Product not found", 404)));

         if (product.Product_Variant[0].quantity < item.quantity + (type === "increment" ? 1 : -1))
            return (next(ApiError.create_error("Insufficient product variant quantity", 400)));

         const [updatedItem, cacheDelete] = await Promise.all([
            this.service.updateCartItem(
               item.id, payload.company_id, type === "increment" ? item.quantity + 1 : item.quantity - 1
            ),
            this.service.deleteCompanyCartCache(payload.company_id)
         ])

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Cart item updated successfully", {
            ...updatedItem
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

export default CartController;
