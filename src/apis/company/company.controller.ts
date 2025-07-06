#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import {companyService} from "./company.service";
import ApiError from "../../middlewares/error.handler";
import { Company, Company_Address, User, UserRole } from "../../../generated/prisma";
import globalUtils from "../../utilies/globals";
import { JWT_PAYLOAD } from "../../types/express";




class CompanyControllerClass {
   private service;
   private MAX_USERS; // each company can have at most 10 users

   constructor () {
      this.service = companyService;
      this.MAX_USERS = 10;
   }

   public Dashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).company;

      try {
         const dashboard_redis = await this.service.getCompanyDashboardRedis(company.id);
         if (dashboard_redis)
            return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived the company dashboard from Cache!", JSON.parse(dashboard_redis)));

         const { total_paid, total_pending, total_orders } = await this.service.getCompanyDashboard(company.id);
         const total_paid_number = total_paid._sum.total_amount

         await this.service.setCompanyDashboardRedis(company.id, {total_paid: total_paid_number || 0, total_pending, total_orders});

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived the company dashboard from DB!", { total_paid: total_paid_number, total_pending, total_orders }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetPendingOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).payload
      const { order_no, page, Limit } = req.query;
      const order_no_value: (number | undefined) = order_no ? Number(order_no) : undefined;
      const page_value: number = page ? Number(page) : 1;
      const limit_value: number = Limit ? Number(Limit) : 10;

      try {
         const {
            orders, total_orders, total_pages, current_page, limit
         } = await this.service.getPendingOrders(company.id, page_value, limit_value, order_no_value);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived the pending orders!", {
            orders,
            total_orders,
            total_pages,
            current_page: current_page || 1,
            limit: limit || 10
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetOrdersHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).company;
      const { order_no, page, Limit } = req.query;
      const order_no_value: (number | undefined) = order_no ? Number(order_no) : undefined;
      const page_value: number = page ? Number(page) : 1;
      const limit_value: number = Limit ? Number(Limit) : 10;

      try {
         const {
            orders, total_orders, total_pages, current_page, limit
         } = await this.service.getOrdersHistory(company.id, page_value, limit_value, order_no_value);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived the orders history!", {
            orders,
            total_orders,
            total_pages,
            current_page: current_page || 1,
            limit: limit || 10
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetCompanyUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).company;

      try {
         const {
            users, total_users
         } = await this.service.getCompanyUsers(company.id);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived the company users!", {
            users,
            total_users
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public CreateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).company;
      const { first_name, last_name, email, password, phone_number, user_role } = req.body;

      try {
         const user_count: number = await this.service.getCompanyUsersCount(company.id);
         if (user_count >= this.MAX_USERS)
            return (next(ApiError.create_error(`You can not add more than ${this.MAX_USERS} users to your company!`, 403)));

         const user = await this.service.createUser({
            first_name, last_name, email, password, phone_number, user_role, company_id: company.id
         });

         return (globalUtils.SuccessfulyResponseJson(res, 201, "User created successfully!", {
            ...user
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public DeleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user: User = (req as any).user;
      const company: Company = (req as any).company;

      try {
         await this.service.deleteUserByID(user.id, company.id);
         return (globalUtils.SuccessfulyResponseJson(res, 200, "User deleted successfully!"));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   
   public UpdateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: JWT_PAYLOAD = (req as any).payload;
      const company: Company = (req as any).company;
      const user: User = (req as any).user;
      const { user_role } = req.body;
      const user_role_value: UserRole = user_role as UserRole;

      if (user.id === payload.user_id)
         return (next(ApiError.create_error("You can not change your own role!", 403)));

      try {
         const updatedUser = await this.service.updateUserRole(user.id, company.id, user_role_value);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "User role updated successfully!", {
            ...updatedUser
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetCompanyAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).company;

      try {
         const { addresses, total_addresses } = await this.service.getCompanyAddresses(company.id);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived the company addresses!", {
            addresses,
            total_addresses
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public AddDeliveryAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).company;
      const {
         street_address, city, country, building_no, state_or_origin, notes
      } = req.body;

      try {
         const address = await this.service.addDeliveryAddress({
            street_address, city, country, building_no, state_or_origin, notes, company_id: company.id
         });

         return (globalUtils.SuccessfulyResponseJson(res, 201, "Delivery address added successfully!", {
            ...address
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public DeleteDeliveryAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { address_id } = req.params;
      const company: Company = (req as any).company;
      try {
         await this.service.deleteDeliveryAddressByID(address_id, company.id);
         return (globalUtils.SuccessfulyResponseJson(res, 200, "Delivery address deleted successfully!"));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public UpdateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const address: Company_Address = (req as any).address;
      const payload: JWT_PAYLOAD = (req as any).payload;
      const company: Company = (req as any).company;
      const {
         street_address, city, country, building_no, state_or_origin, notes
      } = req.body;
      if (address.company_id !== company.id)
         return (next(ApiError.create_error("You can not update this address!", 403)));

      try {
         const updatedAddress = await this.service.updateDeliveryAddress(
            address.id, payload.company_id,
            { street_address, city, country, building_no, state_or_origin, notes}
         );

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Delivery address updated successfully!", {
            ...updatedAddress
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: JWT_PAYLOAD = (req as any).payload;
      const company: Company = (req as any).company;

      try {
         const [user, wallet] = await Promise.all([
            this.service.getUserByID(payload.user_id),
            this.service.getCompanyWallet(company.id)
         ])
         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived the company profile!", {
            company, user, wallet
         }));
      } catch (err) {
         return next(ApiError.create_error(String(err), 500));
      }
   }

   public UpdateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: JWT_PAYLOAD = (req as any).payload;
      const company: Company = (req as any).company;
      const { first_name, last_name, phone_number } = req.body;

      try {
         const updatedUser = await this.service.updateUserProfile(
            payload.user_id, company.id, { first_name, last_name, phone_number }
         )

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Profile updated successfully!", {
            ...updatedUser
         }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

const companyController = new CompanyControllerClass();
export default companyController;
