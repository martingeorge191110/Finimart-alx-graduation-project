#!/usr/bin/env node

export interface AdminCompanyFilteration {
   verified?: boolean;
   city?: string;
   country?: string;
   min_amount_purcahsed?: number;
   max_amount_purcahsed?: number;
}

export interface CompaniesListResponse {
   id: string;
   name: string;
   Super_User: string;
   address: string;
   phone_number: string;
   E_Wallet: number;
   total_amount_purchased: number;
   auth_letter?: string | null;
   fax_number?: string | null;
   created_at: Date;
   updated_at: Date;
   confirmed_orders: number;
   pending_orders: number;
   total_refund: number;
   verified: boolean;
}
