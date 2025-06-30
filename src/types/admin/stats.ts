#!/usr/bin/env node


/**
 * @description - This file defines the types for the dashboard statistics used in the admin panel.
 * It includes the structure of the dashboard stats object, which contains various metrics such as
 * confirmed orders, pending orders, paid amounts, etc.
 */
export interface DashboardStats {
   confirmed_orders: number;
   pending_orders: number;
   returned_orders: number;
   revenues: number;
   refunded_orders: number;
   e_wallet_balance: number;
   unverified_companies: number;
   verified_companies: number;
   categories: { total_categories: number; level: number }[];
   total_products: number;
   total_brands: number;
}