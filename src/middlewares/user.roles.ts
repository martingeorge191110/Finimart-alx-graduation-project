#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import { JWT_PAYLOAD } from "../types/express";
import ApiError from "./error.handler";




export const UserCompanyIDs = (req: Request, res: Response, next: NextFunction) => {
   const payload: JWT_PAYLOAD = (req as any).payload;
   const { company_id } = req.params;

   if (payload.company_id !== company_id)
      return (next(ApiError.create_error("Unauthorized", 401)));

   return (next());
}
