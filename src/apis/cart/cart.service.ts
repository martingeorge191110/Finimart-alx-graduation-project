import { promises } from "nodemailer/lib/xoauth2";
import { MainDB, ReplicaDB } from "../../config/db.config";
import redis from "../../config/redis.config";




class CartService {
   private configMainDB;
   private configReplicaDB;
   private configRedis;

   constructor() {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
      this.configRedis = redis;
   }

   public static getInstance = () => new CartService();

   public getProductByID = async (product_id: string) => {
      try {
         return (await this.configReplicaDB.product.findUnique({
            where: { id: product_id }
         }))
      } catch (err) {
         throw (err);
      }
   }

   public getProductWithVariantByID = async (product_id: string, variant_id: string) => {
      try {
         return (await this.configReplicaDB.product.findUnique({
            where: { id: product_id },
            include: {
               Product_Variant: {
                  where: { id: variant_id },
                  take: 1
               }
            }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public addCartItem = async (payload: {
      created_by_id: string; company_id: string;
   }, product_id: string, variant_id: string | undefined, quantity: number) => {
      try {
         const data: {
            created_by_id: string; company_id: string;
            product_id: string; quantity: number; product_variant_id: string
         } = {
            created_by_id: payload.created_by_id,
            company_id: payload.company_id,
            product_id, quantity, product_variant_id: 'default'
         };

         if (variant_id)
            data.product_variant_id = variant_id;
         else {
            const minVariant = await this.configMainDB.product_Variant.findFirst({
               where: { product_id },
               orderBy: { price: 'asc' },
               take: 1
            });
            if (!minVariant)
               throw new Error("No product variants available");
            data.product_variant_id = minVariant.id;
         }

         return (await this.configMainDB.cart_items.create({ data }));
      } catch (err) {
         throw (err);
      }
   }

   public checkCart = async (company_id: string, product_id: string, variant_id: string | undefined) => {
      try {
         const where: {
            company_id: string, product_id: string, product_variant_id?: string
         } = {
            company_id, product_id
         };

         if (variant_id)
            where.product_variant_id = variant_id;

         return (await this.configMainDB.cart_items.findFirst({ where }));
      } catch (err) {
         throw (err);
      }
   }

   public countCartItemsPerCompany = async (company_id: string) => {
      try {
         return (await this.configReplicaDB.cart_items.count({ where: { company_id } }));
      } catch (err) {
         throw (err);
      }
   }

   public cartItems = async (company_id: string, page: number, limit: number) => {
      try {
         const [items, total] = await Promise.all([
            this.configReplicaDB.cart_items.findMany({
               skip: (page - 1) * limit,
               take: limit,
               where: { company_id },
               include: {
                  Product: {select: {
                     id: true, product_title: true, url_img: true, quantity: true,
                     Product_Variant: { select: { id: true, size: true, quantity: true, price: true } }
                  }},
                  Product_Variant: { select: { id: true, size: true, quantity: true, price: true } },
                  Created_By: { select: { id: true, first_name: true, last_name: true, user_role: true } }
               }
            }),
            this.configReplicaDB.cart_items.count({ where: { company_id } })
         ])
         const totalPages = Math.ceil(total / limit);

         return ({
            items,
            total_items: total,
            total_pages: totalPages,
            current_page: page,
            has_next_page: page < totalPages,
            has_previous_page: page > 1
         })
      } catch (err) {
         throw (err);
      }
   }

   public setCompanyGetCartItemsCache = async (
      company_id: string, items: any[], total_items: number, total_pages: number,
      current_page: number, has_next_page: boolean, has_previous_page: boolean
   ) => {
      try {
         return (await this.configRedis.setEx(
            `company:${company_id}:cart_items:${current_page}`,
            3600, // Cache for 1 hour
            JSON.stringify(
               { items, total_items, total_pages, current_page, has_next_page, has_previous_page }
            )
         ))
      } catch (err) {
         throw (err);
      }
   }

   public getCompanyGetCartItemsCache = async (company_id: string, page: number) => {
      try {
         return (await this.configRedis.get(`company:${company_id}:cart_items:${page}`));
      } catch (err) {
         throw (err);
      }
   }

   public deleteCompanyCartCache = async (company_id: string) => {
      try {
         await this.configRedis.del(`company:${company_id}:cart_items:*`);
      } catch (err) {
         throw (err);
      }
   }

   public getCartItemByID = async (item_id: string) => {
      try {
         return (await this.configReplicaDB.cart_items.findUnique({
            where: { id: item_id }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public deleteItemFromCart = async (item_id: string, company_id: string) => {
      try {
         await this.configMainDB.cart_items.delete({
            where: { id: item_id, company_id }
         })
      } catch (err) {
         throw (err);
      }
   }

   public updateCartItem = async (item_id: string, company_id: string, quantity: number) => {
      try {
         return (await this.configMainDB.cart_items.update({
            where: { id: item_id, company_id },
            data: { quantity }
         }));
      } catch (err) {
         throw (err);
      }
   }

   public getProductVariantByID = async (variant_id: string) => {
      try {
         return (await this.configMainDB.product_Variant.findUnique({
            where: { id: variant_id }
         }));
      } catch (err) {
         throw (err);
      }
   }
}

export default CartService;
