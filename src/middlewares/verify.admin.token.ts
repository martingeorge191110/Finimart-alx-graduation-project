#!/usr/bin/env node
import { Request, Response, NextFunction } from "express";
import ApiError from "./error.handler";
import jwt from "jsonwebtoken";
import { Admin_JWT_PAYLOAD } from "../types/express";


/**
 * @description This middleware is used to verify the token
 * @param req The request object
 * @param res The response object
 * @param next The next function
 */
export const verifyAdminToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   const authorization: string | undefined = req.cookies["access_token"] as string | undefined;
   if (!authorization?.startsWith("Bearer"))
      return (next(ApiError.create_error("Unauthorized", 401)));

   if (!authorization)
      return (next(ApiError.create_error("Unauthorized", 401)));

   const token: string = authorization.split(" ")[1];

   if (!token)
      return (next(ApiError.create_error("Unauthorized", 401)));

   try {
      const decoded = await new Promise((res, rej) => {
         jwt.verify(token, process.env.JWT_KEY as string, (err, decoded) => {
            if (err)
               return (next(ApiError.create_error(String(err), 500)));

            return (res(decoded as Admin_JWT_PAYLOAD));
         })
      }) as Admin_JWT_PAYLOAD;

      (req as any).admin_payload = decoded as Admin_JWT_PAYLOAD;

      return (next());
   } catch (err) {
      return (next(ApiError.create_error(String(err), 500)));
   }
}


export const isAdminAccount = (req: Request, res: Response, next: NextFunction) => {
   const admin_payload: Admin_JWT_PAYLOAD = (req as any).admin_payload;

   if (!admin_payload || !admin_payload.is_manager || !admin_payload.admin_id)
      return (next(ApiError.create_error("Unauthorized", 403)));

   return (next());
}
