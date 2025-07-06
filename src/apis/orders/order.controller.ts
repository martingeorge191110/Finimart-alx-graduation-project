#!/usr/bin/env node
import { Request, Response, NextFunction } from "express";
import orderService from "./order.services";
import ApiError from "../../middlewares/error.handler";
import globalUtils from "../../utilies/globals";
import { JWT_PAYLOAD } from "../../types/express";
import { Company_Address } from "../../../generated/prisma";


class OrdersControllerClass {
   private service;

   constructor () {
      this.service = orderService;
   }

   public CreateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: JWT_PAYLOAD = (req as any).payload;
      const address: Company_Address = (req as any).address;

      if (payload.company_id !== address.company_id)
         return (next(ApiError.create_error("Forbidden: Address does not belong to this company!", 403)));

      try {
         const cart_items = await this.service.getCartItems(payload.company_id);
         if (cart_items.length === 0)
            return (next(ApiError.create_error("Cart is empty!", 400)));

         for (const item of cart_items) {
            if (item.quantity > item.Product_Variant.quantity)
               return (next(ApiError.create_error(`Insufficient stock for product: ${item.Product.product_title}`, 400)));

            if (!item.Product.is_active)
               return (next(ApiError.create_error("Product is unavailable current now!!", 400)));
         }

         let sub_total = 0;

         const orderItems = cart_items.map((item) => {
            const line_total = item.Product_Variant.price * item.quantity;
            sub_total += item.Product_Variant.price * item.quantity;

            return ({
               quantity: item.quantity,
               unit_price: item.Product_Variant.price,
               line_total,
               product_id: item.product_id,
               product_variant_id: item.product_variant_id
            });
         });

         const shipping_amount = 0;
         const tax_amount = 0;
         const total_amount = sub_total + tax_amount + shipping_amount;

         const createOrder = await this.service.createOrder(
            orderItems, payload.company_id, address.id, payload.user_id,
            sub_total, tax_amount, shipping_amount, total_amount
         );

         await this.service.updateProductsQuantity(orderItems);

         await this.service.removeCartItems(payload.company_id);

         return (globalUtils.SuccessfulyResponseJson(res, 201, "Order Created successfully!", {
            ...createOrder
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

const orderController = new OrdersControllerClass();
export default orderController;
