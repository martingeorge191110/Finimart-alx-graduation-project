#!/usr/bin/env node
import { MainDB, ReplicaDB } from "../../config/db.config";
import redis from "../../config/redis.config";
import { Company } from "../../../generated/prisma";
import bcrypt from 'bcrypt';



class CompanyServiceClass {
   private configRedis;
   private configReplicaDB;
   private configMainDB;

   constructor() {
      this.configRedis = redis;
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
   }

   public getCompanyByID = async (company_id: string) => {
      try {
         return (await this.configReplicaDB.company.findUnique({
            where: { id: company_id }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public getCompanyDashboard = async (company_id: string) => {
      try {
         const [total_paid, total_pending, total_orders] = await Promise.all([
            this.configReplicaDB.orders.aggregate({
               _sum: { total_amount: true },
               where: { id: company_id }
            }),
            this.configReplicaDB.orders.count({
               where: { id: company_id, status: "Pending" }
            }),
            this.configReplicaDB.orders.count({
               where: { id: company_id }
            })
         ]);

         return ({ total_paid, total_pending, total_orders });
      } catch (err) {
         throw (err);
      }
   }


   public getCompanyDashboardRedis = async (company_id: string) => {
      try {
         return (await this.configRedis.get(`company_dashboard:${company_id}`));
      } catch (err) {
         throw (err);
      }
   }

   public setCompanyDashboardRedis = async (company_id: string, dashboard: {
      total_paid: number, total_pending: number, total_orders: number
   }) => {
      try {
         await this.configRedis.setEx(`company_dashboard:${company_id}`, 3600, JSON.stringify(dashboard));
      } catch (err) {
         throw (err);
      }
   }

   public getPendingOrders = async (company_id: string, page: number, limit: number, order_no?: number) => {
      try {
         const where: any = { company_id, status: "Pending" };

         if (order_no)
            where.order_no = order_no;


         const [orders, total_orders] = await Promise.all([
            await this.configReplicaDB.orders.findMany({
               skip: (page - 1) * limit,
               take: limit,
               where,
               orderBy: { created_at: "desc" },
               select: {
                  id: true, order_no: true, status: true, total_amount: true, created_at: true,
                  updated_at: true,
                  Created_By: {
                     select: { id: true, first_name: true, last_name: true }
                  },
                  Address: {
                     select: { id: true, street_address: true, city: true, country: true, building_no: true }
                  }
               }
            }),
            this.configReplicaDB.orders.count({ where })
         ]);
         const total_pages = Math.ceil(total_orders / limit);

         return ({
            orders, total_orders, total_pages, current_page: page, limit
         });
      } catch (err) {
         throw (err);
      }
   }

   public getOrdersHistory = async (company_id: string, page: number, limit: number, order_no?: number) => {
      try {
         const where: any = { company_id, status: 'Confirmed' };

         if (order_no)
            where.order_no = order_no;

         const [orders, total_orders] = await Promise.all([
            await this.configReplicaDB.orders.findMany({
               skip: (page - 1) * limit,
               take: limit,
               where,
               orderBy: { created_at: "desc" },
               select: {
                  id: true, order_no: true, status: true, total_amount: true, created_at: true,
                  updated_at: true,
                  Created_By: {
                     select: { id: true, first_name: true, last_name: true }
                  },
                  Address: {
                     select: { id: true, street_address: true, city: true, country: true, building_no: true }
                  }
               }
            }),
            this.configReplicaDB.orders.count({ where })
         ]);
         const total_pages = Math.ceil(total_orders / limit);

         return ({
            orders, total_orders, total_pages, current_page: page, limit
         });
      } catch (err) {
         throw (err);
      }
   }

   public getCompanyUsers = async (company_id: string) => {
      try {
         const [users, total_users] = await Promise.all([
            this.configReplicaDB.user.findMany({
               where: { company_id },
               select: {
                  id: true, first_name: true, last_name: true, email: true,
                  phone_number: true, is_super_user: true, user_role: true, is_blocked: true
               }
            }),
            await this.configReplicaDB.user.count({ where: { company_id } })
         ])

         return ({ users, total_users });
      } catch (err) {
         throw (err);
      }
   }

   /* Create User API */
   public getUserByEmail = async (email: string) => {
      try {
         return (await this.configMainDB.user.findUnique({
            where: { email }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public getUserByPhoneNumber = async (phone_number: string) => {
      try {
         return (await this.configMainDB.user.findUnique({
            where: { phone_number }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public getCompanyUsersCount = async (company_id: string) => {
      try {
         return (await this.configMainDB.user.count({
            where: { company_id }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public createUser = async (userData: {
      first_name: string, last_name: string, email: string, password: string,
      phone_number: string, user_role: (
         "Controller" | "Sub_Controller" | "Order_Maker"
      ), company_id: string
   }) => {
      try {
         const { first_name, last_name, email, password, phone_number, user_role, company_id } = userData;
         const password_hash = await bcrypt.hash(password, 12);

         return (await this.configMainDB.user.create({
            data: {
               first_name, last_name, email, password_hash,
               phone_number, user_role, company_id
            },
            select: {
               id: true, first_name: true, last_name: true, email: true,
               phone_number: true, is_super_user: true, user_role: true,
               created_at: true
            }
         }));
      } catch (err) {
         throw (err);
      }
   }
   /* End of Create user API */

   public getUserByID = async (user_id: string) => {
      try {
         return (await this.configReplicaDB.user.findUnique({
            where: { id: user_id },
            select: {
               id: true, first_name: true, last_name: true, email: true,
               phone_number: true, is_super_user: true, user_role: true, is_blocked: true
            }
         }));
      } catch (err) {
         throw (err);
      }
   }

   /* Delete User API */
   public deleteUserByID = async (user_id: string, company_id: string) => {
      try {
         await this.configMainDB.user.delete({
            where: { id: user_id, company_id }
         });
      } catch (err) {
         throw (err);
      }
   }
   /* End of delete user API */

   public updateUserRole = async (user_id: string, company_id: string, user_role: "Controller" | "Sub_Controller" | "Order_Maker") => {
      try {
         return (await this.configMainDB.user.update({
            where: { id: user_id, company_id },
            data: { user_role },
            select: {
               id: true, first_name: true, last_name: true, email: true,
               phone_number: true, is_super_user: true, user_role: true, is_blocked: true
            }
         }));
      } catch (err) {
         throw (err);
      }
   }
}

const companyService = new CompanyServiceClass();

export { companyService, CompanyServiceClass };