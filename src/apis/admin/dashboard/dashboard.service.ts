#!/usr/bin/env node
import { config } from "dotenv";
import { ReplicaDB, MainDB } from "../../../config/db.config";
import redis from "../../../config/redis.config";
import { DashboardStats } from "../../../types/admin/stats";


class AdminDashboardServiceClass {
   private configMainDB;
   private configReplicaDB;
   private configRedis;

   constructor() {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
      this.configRedis = redis;
   }

   public getStatsDB = async (): Promise< DashboardStats > => {
      try {
         const startOfYear = new Date(new Date().getUTCFullYear(), 0, 1);

         const [
            confirmed_orders, pending_orders, returned_orders,
            revenues, refunded_orders, e_wallet_balance,
            unverified_companies, verified_companies,
            categories, total_products, total_brands
         ] = await Promise.all([
            this.configReplicaDB.orders.count({
               where: { status: "Confirmed" }
            }),
            this.configReplicaDB.orders.count({
               where: { status: "Pending" }
            }),
            this.configReplicaDB.orders.count({
               where: { status: "Returned" }
            }),
            this.configReplicaDB.orders.aggregate({
               _sum: { total_amount: true },
               where: { payment_status: "Paid", created_at: { gte: startOfYear } }
            }),
            this.configReplicaDB.orders.count({
               where: { status: "Returned", payment_status: "ReFunded" }
            }),
            this.configReplicaDB.e_Wallet.aggregate({
               _sum: { balance: true }
            }),
            this.configReplicaDB.company.count({
               where: { verified: false }
            }),
            this.configReplicaDB.company.count({
               where: { verified: true }
            }),
            this.configReplicaDB.$queryRaw
            <{ total_categories: bigint; lvl: number }[]>`
            SELECT COUNT(*) AS total_categories, lvl FROM "Category"
            GROUP BY lvl`,
            this.configReplicaDB.product.count(),
            this.configReplicaDB.brand.count()
         ]);

         return ({
               confirmed_orders, pending_orders, returned_orders,
               revenues: revenues._sum.total_amount || 0,
               refunded_orders,
               e_wallet_balance: e_wallet_balance._sum.balance || 0,
               unverified_companies, verified_companies,
               categories: categories.map((cat) => ({
                  total_categories: Number(cat.total_categories),
                  level: cat.lvl
               })),
               total_products, total_brands
            })
      } catch (err) {
         throw (err);
      }
   }

   public getStatsRedis = async () => {
      try {
         return (await this.configRedis.get("admin_dashboard_stats"));
      } catch (err) {
         throw (err);
      }
   }

   

   public setStatsRedis = async (stats_data: DashboardStats) => {
      try {
         await this.configRedis.setEx("admin_dashboard_stats", 1800, JSON.stringify(stats_data));

         return (true);
      } catch (err) {
         throw (err);
      }
   }

   public resetStatsCache = async () => {
      try {
         console.log("Resetting Admin Dashboard Stats Cache");
         await this.configRedis.del("admin_dashboard_stats");

      } catch (err) {
         throw (err);
      }
   }
}

const adminDashboardService = new AdminDashboardServiceClass();
export default adminDashboardService;