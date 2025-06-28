import { Request } from "express";
import { Admin, Brand, Cart_items, Category, Company, Favourite_Products, Product, User } from "../../generated/prisma";


/* Extend the Request interface to include a custom property
This is useful for adding custom properties to the request object
without modifying the original Express Request interface */
declare module "express" {
   interface Request {
      payload?: JWT_PAYLOAD;
      admin?: Admin;
      admin_payload?: JWT_PAYLOAD;
   }
};

/**
 * @description This is the type for the JWT payload
 */
export interface JWT_PAYLOAD {
   user_id: string;
   user_role: string;
   is_super_user: boolean;
   company_id: string;
   iat?: number;
   exp?: number;
}

/**
 * @description This is the type for the Admin JWT payload
 */
export interface Admin_JWT_PAYLOAD {
   admin_id?: string;
   is_manager: boolean;
   iat?: number;
   exp?: number;
}
