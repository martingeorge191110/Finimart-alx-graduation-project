import { NextFunction, Request, Response } from "express";
import FavouriteServiceClass from "./favourite.service";
import ApiError from "../../middlewares/error.handler";
import { JWT_PAYLOAD } from "../../types/express";
import { Favourite_Products, Product } from "../../../generated/prisma";
import globalUtils from "../../utilies/globals";




class FavouriteControllerClass {
   private service;

   constructor () {
      this.service = FavouriteServiceClass.getInstance();
   }

   public NewFavourite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const product: Product = (req as any).product;
      const payload: JWT_PAYLOAD = (req as any).payload;

      try {
         const isNotFavourite = await this.service.isNotFavourite(payload.company_id, product.id);
         if (!isNotFavourite)
            return (next(ApiError.create_error("Product is already a favourite", 400)));

         const favourite = await this.service.createFavorute(payload.user_id, payload.company_id, product.id);

         return (globalUtils.SuccessfulyResponseJson(res, 201, "Favourite created successfully", { ...favourite }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetFavorutiesPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: JWT_PAYLOAD = (req as any).payload;
      const { page, limit } = req.query;
      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 10;

      try {
         const {
            favourites, total,
            total_pages, current_page,
            has_next_page, has_previous_page
         } = await this.service.getFavouritesPaginated(payload.company_id, pageNumber, limitNumber);
         if (favourites.length === 0)
            return (globalUtils.SuccessfulyResponseJson(res, 200, "No favourites found", []));

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Favourites retrieved successfully", {
            favourites, total, total_pages, current_page, has_next_page, has_previous_page
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public DeleteFavouriteByID = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const favourite: Favourite_Products = (req as any).favourite;
      const payload: JWT_PAYLOAD = (req as any).payload;

      if (favourite.company_id !== payload.company_id)
         return (next(ApiError.create_error("You are not allowed to delete this favourite", 403)));

      try {
         const deletedFavourite = await this.service.deleteFavourite(favourite.id, payload.company_id);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Favourite deleted successfully", deletedFavourite));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
};

const favouriteController = new FavouriteControllerClass();
export default favouriteController;
