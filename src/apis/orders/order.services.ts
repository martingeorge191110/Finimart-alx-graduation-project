#!/usr/bin/env node
import { MainDB, ReplicaDB } from "../../config/db.config";
import redis from "../../config/redis.config";
import { Product_Variant, Product, Cart_items } from "../../../generated/prisma";
import { get } from "http";
import productController from "../products/products.controller";



class OrderServiceClass {
   private configRedis;
   private configRePlicaDB;
   private configMainDB;

   constructor() {
      this.configRedis = redis;
      this.configMainDB = MainDB;
      this.configRePlicaDB = ReplicaDB;
   }

   public getCartItems = async (company_id: string) => {
      try {
         return (await this.configMainDB.cart_items.findMany({
            where: { company_id },
            include: {
               Product: true,
               Product_Variant: true
            }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public getAddressByID = async (address_id: string) => {
      try {
         return (await this.configMainDB.company_Address.findUnique({
            where: { id: address_id }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public createOrder = async (order_items: {
      quantity: number, unit_price: number, line_total: number,
      product_id: string, product_variant_id: string
   }[],
      company_id: string, address_id: string, user_id: string,
      sub_total: number, tax_amount: number, shipping_amount: number,
      total_amount: number, currency: string = "EGP"
   ) => {
      try {
         const order = await this.configMainDB.orders.create({
            data: {
               company_id,
               address_id,
               created_by_id: user_id,
               sub_total,
               tax_amount,
               shipping_amount,
               total_amount,
               currency,
               discount_amount: 0,
               order_date: new Date(),
               payment_method: 'Cash on Delivery',
               Order_Items: {
                  create: order_items.map(ele => ({
                     quantity: ele.quantity,
                     unit_price: ele.unit_price,
                     line_total: ele.line_total,
                     product_id: ele.product_id,
                     product_variant_id: ele.product_variant_id,
                     item_discount_amount: 0
                  }))
               }
            }
         });

         return (order);
      } catch (err) {
         throw (err);
      }
   }
   
   public updateProductsQuantity = async (order_itmes: {
      quantity: number, unit_price: number, line_total: number,
      product_id: string, product_variant_id: string
   }[]) => {
      try {
         await Promise.all(
            order_itmes.map(item => {
               this.configMainDB.product.update({
                  where: { id: item.product_id },
                  data: {
                     quantity: { decrement: item.quantity },
                     Product_Variant: {
                        update: {
                           where: { id: item.product_variant_id },
                           data: {
                              quantity: {
                                 decrement: item.quantity
                              }
                           }
                        }
                     }
                  }
               })
            })
         )
      } catch (err) {
         throw (err);
      }
   }

   public removeCartItems = async (company_id: string) => {
      try {
         await this.configMainDB.cart_items.deleteMany({
            where: { company_id }
         });
      } catch (err) {
         throw (err);
      }
   }
}

const orderService = new OrderServiceClass();
export default orderService;
