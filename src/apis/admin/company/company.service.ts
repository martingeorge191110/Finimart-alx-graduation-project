#!/usr/bin/env node
import { error } from "console";
import { Company } from "../../../../generated/prisma";
import { MainDB, ReplicaDB } from "../../../config/db.config";
import redis from "../../../config/redis.config";
import { AdminCompanyFilteration, CompaniesListResponse } from "../../../types/admin/companies.admins";
import companyController from "../../company/company.controller";



class AdminCompanyServiceClass {
   private configMainDB;
   private configReplicaDB;
   private configRedis;

   constructor() {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
      this.configRedis = redis;
   }

   public getCompaniesFiltered = async (
      page: number = 1, limit: number = 20, sort_by: string = "created_at",
      filteration: AdminCompanyFilteration
   ): Promise<CompaniesListResponse[]> => {
      try {
         const companies = await this.configMainDB.company.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { [`${sort_by}`]: "desc" },
            select: {
               id: true, name: true,
               Super_User: { select: { id: true, first_name: true, last_name: true } },
               address: true, phone_number: true, E_Wallet: { select: { balance: true } },
               total_amount_purchased: true, auth_letter: true, fax_number: true,
               created_at: true, updated_at: true, verified: true
            },
            where: {
               verified: filteration.verified,
               city: filteration.city !== undefined ? { contains: filteration.city, mode: "insensitive" } : undefined,
               country: filteration.country !== undefined ? { contains: filteration.country, mode: "insensitive" } : undefined,
               total_amount_purchased: {
                  gte: filteration.min_amount_purcahsed || 0,
                  lte: filteration.max_amount_purcahsed || Number.MAX_SAFE_INTEGER
               }
            }
         });

         const full_companies_data = await Promise.all(
            companies.map(async (company, i) => {
               const [confirmed_orders, pending_orders, total_refund] = await Promise.all([
                  this.configReplicaDB.orders.count({
                     where: { company_id: company.id, status: "Confirmed" }
                  }),
                  this.configReplicaDB.orders.count({
                     where: { company_id: company.id, status: "Pending" }
                  }),
                  this.configReplicaDB.orders.count({
                     where: { company_id: company.id, payment_status: "ReFunded" }
                  })
               ]);

               return ({
                  ...company, E_Wallet: company.E_Wallet?.balance || 0,
                  Super_User: `${company.Super_User?.first_name} ${company.Super_User?.last_name}`,
                  confirmed_orders, pending_orders, total_refund
               });
            })
         );

         return (full_companies_data);
      } catch (err) {
         throw (err);
      }
   }

   public getTotalCompaniesFiltered = async (filters: AdminCompanyFilteration): Promise<number> => {
      try {
         return (await (this.configReplicaDB.company.count({
            where: {
               verified: filters.verified,
               city: { contains: filters.city, mode: "insensitive" },
               country: { contains: filters.country, mode: "insensitive" },
               total_amount_purchased: {
                  gte: filters.min_amount_purcahsed || 0,
                  lte: filters.max_amount_purcahsed || Number.MAX_SAFE_INTEGER
               }
            }
         })));
      } catch (err) {
         throw (err);
      }
   }


   public updateCompanyData = async (company_id: string, data: any) => {
      try {
         return (await (this.configMainDB.company.update({
            where: { id: company_id },
            data: {
               ...data
            }
         })));
      } catch (err) {
         throw (err);
      }
   }

}

const adminCompanyService = new AdminCompanyServiceClass();
export default adminCompanyService;
