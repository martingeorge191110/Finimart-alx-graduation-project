#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import ApiError from "../../../middlewares/error.handler";
import bcrypt from 'bcrypt';
import { Admin } from "../../../../generated/prisma";
import AdminAuthService from "./auth.admin.service";
import AdminAuthUtilies from "./auth.admin.utilies";
import globalUtils from "../../../utilies/globals";
import { Admin_JWT_PAYLOAD } from "../../../types/express";
import crypto from 'crypto';



class AdminAuthControllerClass {

   private service;

   constructor() {
      this.service = AdminAuthService;
   }

   public Login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const admin: (any) = (req as any).admin;
      const { password } = req.body;

      try {
         // checking the password is valid or not
         const is_passwrod_true = await bcrypt.compare(password, admin.password);
         if (!is_passwrod_true)
            return (next(ApiError.create_error("Email or Password is not valid!", 400)));

         if (await this.service.refreshTokenCouter(admin.id) > 3)
            await this.service.removeAllRefreshToken(admin.id);

         // creating new one in case of expired
         const refreshToken = crypto.randomBytes(64).toString("hex");
         const tokenEncrypted = await bcrypt.hash(refreshToken, 12);
         const refresh_token = await this.service.createRefreshToken(admin.id, tokenEncrypted);

         // checking the refresh token
         if (!refresh_token)
            return (next(ApiError.create_error("Server Failure", 500)));

         // removing all of expired refresh token for this admin
         await this.service.removeAllRefreshTokensExpired(admin.id);

         // creating the access token with jwt
         const payload = { admin_id: admin.id, is_manager: admin.is_manager };

         const access_token = AdminAuthUtilies.create_access_token(payload);

         // set cookies in admin pannel (access token && refresh token)
         // tokenID.tokenEncrypted
         const refresh_token_client = `${refresh_token.id}.${refreshToken}`;
         AdminAuthUtilies.set_cookies(res, access_token, refresh_token_client);

         // send the response
         return (globalUtils.SuccessfulyResponseJson(res, 200, "Login successful", { ...admin, access_token, refresh_token: refreshToken }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   /**
    * @description This Controller is used to Refresh a new access token
    *             - ()
    * @param req - The request object
    * @param res - The response object
    * @param next - The next function
    */
   public RefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { refresh_token } = req.cookies;

      const [tokenID, token] = (refresh_token as string).split('.');
      try {
         const refresh_token_record = await this.service.getAdminRefreshTokenByRefreshToken(tokenID);

         if (!refresh_token_record)
            return (next(ApiError.create_error("Refresh token not found", 404)));

         if (refresh_token_record.revoked)
            return (next(ApiError.create_error("Refresh token revoked", 401)));

         if (refresh_token_record.expires_at < new Date()) {
            await this.service.removeRefreshToken(tokenID, refresh_token_record.admin_id);
            return (next(ApiError.create_error("Refresh token expired, Please login again", 401)));
         }

         const admin = await this.service.getAdminById(refresh_token_record.admin_id);

         if (!admin)
            return (next(ApiError.create_error("User not found", 404)));

         const payload = { admin_id: admin.id, is_manager: admin.is_manager };

         const access_token = AdminAuthUtilies.create_access_token(payload);

         res.cookie("access_token", `Bearer ${access_token}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1 * 60 * 60 * 1000, // 1 hour
         });

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Token refreshed", { ...admin, access_token, refresh_token }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   /**
    * @description This function is used to logout a user (removing the refresh token from the database)
    * @param req - The request object
    * @param res - The response object
    * @param next - The next function
    */
   public Logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: Admin_JWT_PAYLOAD = (req as any).admin_payload;
      const { refresh_token } = req.cookies;
      const [tokenID, token] = (refresh_token as string).split('.');

      try {
         const refresh_token_record = await this.service.getAdminRefreshTokenByRefreshToken(tokenID);

         if (!refresh_token_record)
            return (next(ApiError.create_error("Refresh token not found", 404)));

         if (refresh_token_record.revoked)
            return (next(ApiError.create_error("Refresh token revoked", 401)));

         await this.service.removeRefreshToken(refresh_token_record.token, payload.admin_id as string);

         res.clearCookie("refresh_token");
         res.clearCookie("access_token");

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Logout successful"));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   /**
    * @description This function is used to get the current admin profile
    * @param req - The request object
    * @param res - The response object
    * @param next - The next function
    */
   public isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: Admin_JWT_PAYLOAD = (req as any).admin_payload;

      try {
         // Try to get from cache first
         const cachedAdmin = await this.service.getAdminFromCache(payload.admin_id as string);
         if (cachedAdmin)
            return (globalUtils.SuccessfulyResponseJson(res, 200, "Admin is authenticated", { ...cachedAdmin }));

         const admin = await this.service.getAdminById(payload.admin_id as string);

         if (!admin)
            return (next(ApiError.create_error("Admin not found", 404)));

         await this.service.setAdminInCache(payload.admin_id as string, admin);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Admin is authenticated", { ...admin }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

const AdminAuthController = new AdminAuthControllerClass();
export default AdminAuthController;
