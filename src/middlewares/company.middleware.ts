import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "./error.handler";
import { MainDB, ReplicaDB } from "../config/db.config";
import { Company } from "../../generated/prisma";
import { validate as isUUID } from "uuid";
import { JWT_PAYLOAD } from "../types/express";


class CompanyMiddlewares {
   private configMainDB;
   private configReplicaDB;
   private static instance: CompanyMiddlewares;

   constructor () {
      this.configMainDB = MainDB;
      this.configReplicaDB = ReplicaDB;
   }

   public static getInstance = () => {
      if (!CompanyMiddlewares.instance)
         CompanyMiddlewares.instance = new CompanyMiddlewares();

      return (CompanyMiddlewares.instance);
   }

   public isComapnyExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: JwtPayload = (req as any).payload;
   
      if (!payload.company_id || payload.company_id.trim() === "")
         return next(ApiError.create_error("Forbidden: No company ID provided", 403));

      if (!isUUID(payload.company_id))
         return (next(ApiError.create_error("Invalid Company ID!", 400)));

      try {
         const company = await this.configMainDB.company.findUnique({
            where: { id: payload.company_id }
         });

         if (!company)
            return (next(ApiError.create_error("Invalid Company ID!", 404)));

         (req as any).company = company as Company;
         return (next());
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public isCompanyValid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const company: Company = (req as any).company;

      if (!company)
         return (next(ApiError.create_error("Company not found in request", 400)));

      if (company.blocked)
         return (next(ApiError.create_error("This company is blocked!", 403)));

      if (!company.verified)
         return (next(ApiError.create_error("This company is not verified!", 403)));

      return (next());
   }

   public isSuperUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: JWT_PAYLOAD = (req as any).payload;

      if (!payload.is_super_user)
         return (next(ApiError.create_error("Forbidden: You are not a super user", 403)));

      if (payload.is_super_user !== true)
         return (next(ApiError.create_error("Forbidden: You are not a super user", 403)));

      return (next());
   }
}

export default CompanyMiddlewares;
