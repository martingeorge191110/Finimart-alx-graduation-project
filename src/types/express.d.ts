import { Request } from "express";
import { Admin, Brand, Cart_items, Category, Company, Company_Address, Favourite_Products, Product, Product_Variant, User } from "../../generated/prisma";


type ProductWithVariant = Product & { Product_Variant: Product_Variant } & { ordered_quantity: number };

/* Extend the Request interface to include a custom property
This is useful for adding custom properties to the request object
without modifying the original Express Request interface */
declare module "express" {
   interface Request {
      user?: User;
      status_code?: number;
      auth_letter_public_id?: string;
      payload?: JWT_PAYLOAD;
      admin?: Admin;
      admin_payload?: JWT_PAYLOAD;
      category?: Category;
      brand_img_uri?: string;
      brand?: Brand;
      product_img_url?: string;
      company?: Company;
      product?: Product;
      favourite?: Favourite_Products;
      cart_item?: Cart_items;
      address?: Company_Address;
      products_with_variants?: (ProductWithVariant | null)[];
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
