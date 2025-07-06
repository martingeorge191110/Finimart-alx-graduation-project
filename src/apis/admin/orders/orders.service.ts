#!/usr/bin/env node
import { OrderPaymentStatus, OrderStatus } from "../../../../generated/prisma";
import { MainDB, ReplicaDB } from "../../../config/db.config";
import redis from "../../../config/redis.config";
import { OrderByType, OrderStatusType } from "../../../types/admin/orders.admin";


class AdminOrdersServiceClass {
   private configMainDB;
   private configReplicaDB;
   private configRedis;

   constructor () {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
      this.configRedis = redis;
   }


   public static createInstance = () => (new AdminOrdersServiceClass());

   public getOrdersPaginatedFilterd = async (page: number, limit: number, filteration: {
      search_by_company?: string, created_at?: Date, order_by?: OrderByType, status?: OrderStatusType
   }) => {
      try {
         const skip = (page - 1) * limit;
         const where: any = {};
         // Apply filters if they exist
         if (filteration.search_by_company)
            where.Company = {
               name: {
                  contains: filteration.search_by_company,
                  mode: 'insensitive'
               }
            };


         if (filteration.created_at)
            where.created_at = {
               gte: new Date(filteration.created_at.setHours(0, 0, 0, 0)),
               lt: new Date(filteration.created_at.setHours(23, 59, 59, 999))
            };

         if (filteration.status)
            where.status = filteration.status;

         const [total, orders] = await Promise.all([
            this.configReplicaDB.orders.count({ where }),
            this.configReplicaDB.orders.findMany({
               where, skip, take: limit,
               orderBy: {
                  order_no: filteration.order_by ? filteration.order_by : 'desc'
               },
               include: {
                  Company: {
                     select: { id: true, name: true }
                  },
                  Created_By: {
                     select: { id: true, first_name: true, last_name: true, is_super_user: true }
                  },
                  Address: {
                     select: { id: true, street_address: true, city: true }
                  },
                  _count: {
                     select: { Order_Items: true }
                  }
               }
            })
         ])

         return ({
            total, orders
         })
      } catch (err) {
         throw (err);
      }
   }

   public getOrderDetailsByID = async (order_id: string) => {
      try {
         return (await this.configReplicaDB.orders.findUnique({
            where: { id: order_id },
            include: { 
               Company: {
                  select: { id: true, name: true,
                     phone_number: true,
                     Super_User: {
                        select: {
                           id: true, first_name: true, last_name: true
                        }
                     }
                  }
               },
               Address: true,
               Created_By: {
                  select: { id: true, first_name: true, last_name: true, user_role: true, phone_number: true, email: true }
               },
               Order_Items: {
                  include: {
                     Product: true,
                     Product_Variant: true
                  }
               },
               Invoice: true
            }
         }))
      } catch (err) {
         throw (err);
      }
   }

   public getOrderByID = async (order_id: string) => {
      try {
         return (await this.configReplicaDB.orders.findUnique({ where: { id: order_id } }))
      } catch (err) {
         throw (err);
      }
   }

   public updateOrderStatusAndPayment = async (order_id: string, status: OrderStatus, payment_status?: OrderPaymentStatus) => {
      try {
         return (await this.configMainDB.orders.update({
            where: { id: order_id },
            data: {
               status,
               payment_status
            }
         }))
      } catch (err) {
         throw (err);
      }
   }

}

const adminOrderService = AdminOrdersServiceClass.createInstance();
export default adminOrderService;
