#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import AdminUsersService from "./users.service";
import ApiError from "../../../middlewares/error.handler";
import globalUtils from "../../../utilies/globals";



class AdminUsersControllerClass {
   private service;

   constructor () {
      this.service = AdminUsersService;
   }

   /**
    * @description - Get users with pagination and optional filters
    *              - Supports searching by company name, filtering by super user status, and filtering by creation date.
    *              - Caches results for common queries to improve performance (just if the user choose the page or limit no others!).
    * @param req 
    * @param res 
    * @param next 
    * @returns 
    */
   public GetUsersPagination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { page, limit, search_by_company_name, is_super_user, created_at } = req.query;
      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 20;

      const filteration = {
         search_by_company_name: search_by_company_name ? String(search_by_company_name) : undefined,
         is_super_user: is_super_user ? Boolean(is_super_user) : undefined,
         created_at: created_at ? new Date(String(created_at)) : undefined
      }

      try {

         const [users, total_users] = await Promise.all([
            this.service.searchingUsersPaginated(pageNumber, limitNumber, filteration),
            this.service.totalUsersCount(filteration)
         ])

         const total_pages = Math.ceil(total_users / limitNumber);
         const has_next_page = pageNumber < total_pages;
         const has_previous_page = pageNumber > 1;

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Users fetched successfully!", {
            users, total_users, total_pages, has_next_page, has_previous_page
         }))
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

const AdminUsersController = new AdminUsersControllerClass();
export default AdminUsersController;
