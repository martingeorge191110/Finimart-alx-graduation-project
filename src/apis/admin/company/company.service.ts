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

   public deleteCompanyByID = async (company_id: string): Promise<void> => {
      try {
         // Optional: Delete related data first if constraints exist (e.g., E_Wallet, Users, etc.)
         await this.configMainDB.company.delete({
            where: { id: company_id },
         });

         // Optionally remove from Redis too
         const redisKey = `company:${company_id}`;
         await this.configRedis.del(redisKey);
      } catch (err) {
         throw err;
      }
   };

   public updateCompanyInRedis = async (company_data: Company) => {
      try {
         const companyKey = `company:${company_data.id}`;
         const exists = await this.configRedis.exists(companyKey);

         if (exists) {
            // Update the company data in Redis with 1 hour expiration
            await this.configRedis.setEx(companyKey, 3600, JSON.stringify(company_data));
            return (true);
         }

         return (false);
      } catch (error) {
         console.error(`Error updating company in Redis: ${error}`);
         throw (error);
      }
   };

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

   public getCompanyByName = async (name: string): Promise<Company | null> => {
      return await this.configMainDB.company.findUnique({ where: { name: name } });
   }

   public updateCompanyWallet = async (company_id: string, amount: number, type: "add" | "subtract") => {
      try {
         const transaction = await this.configMainDB.$transaction(async (tx) => {
            const e_Wallet = await tx.e_Wallet.findUnique({ where: { company_id } });

            if (!e_Wallet) {
               // special case !!
               await tx.e_Wallet.create({ data: { company_id } });
            }

            const updatedWallet = await tx.e_Wallet.update({
               where: { company_id },
               data: { balance: type === "add" ? { increment: amount } : { decrement: amount } }
            });

            return (updatedWallet);
         })
         return (transaction);
      } catch (err) {
         throw (err);
      }
   }

   public getAllCompanyWallet = async (page: number = 1, limit: number = 20, min_balance?: number, max_balance?: number) => {
      try {
         if (page < 1) throw new Error("Page number must be 1 or greater");
         if (limit < 1 || limit > 20) throw new Error("Limit must be between 1 and 20.");

         const balanceFilter: any = {};

         if (typeof min_balance == "number") { balanceFilter.gte = min_balance };
         if (typeof max_balance == "number") { balanceFilter.lte = max_balance };

         const filteredBalance = Object.keys(balanceFilter).length > 0 ? { balance: balanceFilter } : {};

         const totalWalletsWithFilter = await this.configReplicaDB.e_Wallet.count({
            where: filteredBalance,
         });

         const wallets = await this.configReplicaDB.e_Wallet.findMany({
            where: filteredBalance,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { updated_at: "desc" },
            select: {
               balance: true,
               company_id: true,
               updated_at: true,
               Company: {
                  select: {
                     name: true,
                     Super_User: {
                        select: { id: true, first_name: true, last_name: true, is_super_user: true,
                        }
                     }
                  },
               },
            },
         });

         return {
            total: totalWalletsWithFilter,
            pages: Math.ceil(totalWalletsWithFilter / limit),
            currentPage: page,
            data: wallets,
         };
      } catch (err) {
         throw err;
      }
   };
}

const adminCompanyService = new AdminCompanyServiceClass();
export default adminCompanyService;
