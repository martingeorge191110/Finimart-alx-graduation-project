#!/usr/bin/env node
import { Category, Product } from "../../../generated/prisma";
import { MainDB, ReplicaDB } from "../../config/db.config";
import redis from "../../config/redis.config";
import BrandsRoutes from "../admin/brands/brands.routes";



class ProductServicesClass {
   private configReplicaDB;
   private configMainDB;
   private configRedis;

   constructor() {
      this.configReplicaDB = ReplicaDB;
      this.configMainDB = MainDB;
      this.configRedis = redis
   }


   public getProductByIdRedis = async (product_id: string) => {
      try {
         return (await this.configRedis.hGet("products", product_id));
      } catch (err) {
         throw (err);
      }
   }

   public setProductInRedis = async (product_id: string, product: any) => {
      try {
         await this.configRedis.hSet("products", product_id, JSON.stringify(product));
      } catch (err) {
         throw (err);
      }
   }

   public resetProductCache = async (product_id: string, options?: { resetBestSellers?: boolean }) => {
      try {
         // Remove specific product from Redis hash
         await this.configRedis.hDel("products", product_id);
         await this.configRedis.del("admin_dashboard_stats");
         // Optionally reset best_sellers cache
         if (options?.resetBestSellers) {
            await this.configRedis.del("best_sellers");
            await this.configRedis.del("admin_dashboard_stats");
         }
      } catch (err) {
         throw err;
      }
   };

   public getProductByIdDB = async (product_id: string) => {
      try {
         return (await this.configReplicaDB.product.findUnique({
            where: { id: product_id },
            include: {
               Product_Categories: true,
               Brand: { select: { id: true, name: true, img_url: true } },
               Product_Specs: {
                  select: {
                     id: true, value: true,
                     Specs_Defination: { select: { id: true, key_name: true, unit: true } }
                  }
               },
               Product_Variant: { select: { id: true, size: true, quantity: true, price: true } }
            }
         }))
      } catch (err) {
         throw (err);
      }
   }

   public findBrandByIdRedis = async (brand_id: string) => {
      try {
         return (await this.configRedis.hGet("brands", brand_id));
      } catch (err) {
         throw (err);
      }
   }

   public getBestSellersRedis = async (): Promise<any[] | null> => {
      try {
         const data = await this.configRedis.hGetAll("best_sellers");

         if (!data || Object.keys(data).length === 0) return null;

         const parsedProducts = Object.values(data).map(item => JSON.parse(item as string));

         return parsedProducts;

      } catch (err) {
         throw err;
      }
   }

   public setBestSellersRedis = async (products: any[]): Promise<void> => {
      try {
         const hashData: Record<string, string> = {};

         products.forEach((product, index) => {
            hashData[String(index)] = JSON.stringify(product);
         });

         await this.configRedis.hSet("best_sellers", hashData);

      } catch (err) {
         throw err;
      }
   }

   public resetBrandCache = async (brand_id: string) => {
      try {
         await this.configRedis.hDel("brands", brand_id);
         await this.configRedis.del("admin_dashboard_stats");
      } catch (err) {
         throw err;
      }
   };

   public getBestSellersListDB = async () => {
      try {
         return await this.configReplicaDB.best_Selling_Products.findMany({
            take: 8,
            orderBy: { created_at: 'desc' },
            select: {
               product_id: true,
               Product: {
                  select: {
                     product_title: true,
                     url_img: true,
                     product_code: true,
                     description: true,
                     Brand: true,
                     price_range: true,
                     quantity: true,
                     is_active: true,
                     Product_Variant: {
                        select: {
                           size: true,
                           price: true,
                           quantity: true,
                        }
                     }
                  }
               }
            }
         });
      } catch (err) {
         throw (err);
      }
   }

   public getProductSearch = async (search: string, root: string) => {
      try {
         if (root === 'all') {
            return (await this.configReplicaDB.product.findMany({
               where: { product_title: { contains: search, mode: "insensitive" } }
            }))
         }

         // get children ids from redis cache of specific category root id
         const fromCache = await redis.get(`childrenIDS:${root}`);

         let children: Category[];
         if (fromCache) {
            children = JSON.parse(fromCache);
            console.log('Data from cache:', JSON.parse(fromCache));
         } else {
            children = await MainDB.category.findMany({
               where: { parent_id: root }
            })
            await redis.set(`childrenIDS:${root}`, JSON.stringify(children))
         }

         const childrenIDS = children.map(child => child.id);

         const childrenLVL2 = await MainDB.category.findMany({
            where: { parent_id: { in: childrenIDS } }
         });

         const childrenLVL2IDS = childrenLVL2.map(child => child.id);
         const productsData = await MainDB.product_Categories.findMany({
            where: {
               category_id: { in: childrenLVL2IDS },
               Product: { product_title: { contains: search, mode: 'insensitive' } }
            },
            select: { category_id: true, Product: true }
         });

         return (productsData.map(item => item.Product));
      } catch (err) {
         throw (err);
      }
   }

   public getProductList = async (query: any) => {

      const {
         page = 1,
         root_id,
         lvl1,
         lvl2,
         brand = "null",
         price_range = "Economic",
         minPriceRange = 0,
         maxPriceRange,
      } = query;

      try {
         const pageNumber = parseInt(page as string) || 1;
         const PageSize = 12;
         const skip = (pageNumber - 1) * PageSize;

         const cacheKey = `filtered_products:page=${pageNumber}:root=${root_id}:lvl1=${lvl1}:lvl2=${lvl2}:brand=${brand}:range=${price_range}:min=${minPriceRange}:max=${maxPriceRange}`;

         const chachedData = await this.configRedis.get(cacheKey);

         if (chachedData) {
            return JSON.parse(chachedData);
         }

         const filters: any = {};

         if(root_id) filters.root_category_id = root_id;
         if(lvl1) filters.lvl1_category_id = lvl1;
         if(lvl2) filters.lvl2_category_id = lvl2;
         if(brand && brand !== "null") filters.brand_id = brand;
         if(price_range) filters.price_range = price_range;
         if(minPriceRange || maxPriceRange) {
            filters.price = {};
            if (minPriceRange) filters.price.gte = Number(minPriceRange);
            if (maxPriceRange) filters.price.lte = Number(maxPriceRange);
         }

         filters.is_active = true;

         const totalCount = await this.configReplicaDB.product.count({ where: filters});

         const productList = await this.configReplicaDB.product.findMany({
            where: filters,
            skip: skip,
            take: PageSize,
            select: {
               id: true,
               product_title: true,
               url_img: true,
               product_code: true,
               description: true,
               color: true,
               price_range: true,
               brand_id: true,
               Brand: {
                  select: { id: true, name: true, img_url: true }
               },
               Product_Variant: {
                  orderBy: {
                  price: "asc"
                  },
                  take: 1,
                  select: {
                  size: true,
                  price: true,
                  quantity: true
                  }
               }
            }
         });

         const response = {
            pagination: {
               total: totalCount,
               page: pageNumber,
               per_page: PageSize,
               totalPages: Math.ceil(totalCount / PageSize),
            },
            products: productList
         };

         await this.configRedis.set(cacheKey, JSON.stringify(response), { EX: 3600 }); // Cache for 1 hour

         return response;
      } catch (err) {
         throw (err);
      }
   }
}

const productService = new ProductServicesClass();
export default productService;
