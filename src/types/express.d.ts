import { Request } from "express";
import { Admin, Brand, Cart_items, Category, Company, Favourite_Products, Product, User } from "../../generated/prisma";


/* Extend the Request interface to include a custom property
This is useful for adding custom properties to the request object
without modifying the original Express Request interface */
declare module "express" {
   interface Request {

   }
};
