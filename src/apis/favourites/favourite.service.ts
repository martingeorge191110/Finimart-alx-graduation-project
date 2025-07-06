import { MainDB, ReplicaDB } from "../../config/db.config";




class FavouriteServiceClass {
   private configMainDB;
   private configReplicaDB;

   constructor() {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
   }

   public getProduct = async (product_id: string) => {
      try {
         const product = await this.configReplicaDB.product.findUnique({
            where: { id: product_id }
         });

         if (!product)
            throw new Error("Company not found");

         return (product);
      } catch (error) {
         throw (error);
      }
   }

   public isNotFavourite = async (company_id: string, product_id: string) => {
      try {
         const favourite = await this.configMainDB.favourite_Products.findFirst({
            where: { company_id, product_id }
         });

         if (favourite)
            throw (new Error("Product is already a favourite"));

         return (true);
      } catch (error) {
         throw (error);
      }
   }

   public createFavorute = async (created_by_id: string, company_id: string, product_id: string) => {
      try {
         const favourite = await this.configMainDB.favourite_Products.create({
            data: { created_by_id, company_id, product_id }
         });

         return (favourite);
      } catch (error) {
         throw (error);
      }
   }

   public getFavouritesPaginated = async (company_id: string, page: number, limit: number) => {
      try {
         const [favourites, total] = await Promise.all([
            this.configReplicaDB.favourite_Products.findMany({
               skip: (page - 1) * limit,
               take: limit,
               where: { company_id },
               include: {
                  Created_By: { select: { id: true, first_name: true, last_name: true, user_role: true } },
                  Product: {
                     include: {
                        Brand: { select: { id: true, name: true, img_url: true } },
                        Product_Variant: { select: { id: true, size: true, price: true } }
                     }
                  }
               },
               orderBy: { created_at: 'desc' }
            }),
            this.configReplicaDB.favourite_Products.count({ where: { company_id  }})
         ]);

         const totalPages = Math.ceil(total / limit);
         return ({
            favourites, total,
            total_pages: totalPages,
            current_page: page,
            has_next_page: page < totalPages,
            has_previous_page: page > 1
         })
      } catch (err) {
         throw (err);
      }
   }

   public getFavouriteByID = async (favourite_id: string) => {
      try {
         const favourite = await this.configReplicaDB.favourite_Products.findUnique({
            where: { id: favourite_id }
         });

         return (favourite);
      } catch (err) {
         throw (err);
      }
   }

   public deleteFavourite = async (favourite_id: string, company_id: string) => {
      try {
         await this.configMainDB.favourite_Products.delete({
            where: { company_id, id: favourite_id }
         });
      } catch (err) {
         throw (err);
      }
   }

   public static getInstance = () => new FavouriteServiceClass();
}

export default FavouriteServiceClass;
