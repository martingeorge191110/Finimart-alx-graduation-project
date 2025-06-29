#!/usr/bin/env ts-node
import { Request, Response, NextFunction } from "express";
import ApiError from "../../middlewares/error.handler";
import { authService, AuthServiceClass } from "./auth.service";
import { User, RefreshToken, UserRole } from "../../../generated/prisma";
import bcrypt from "bcrypt";
import { auhtUtilies, AuthUtiliesClass } from "./auth.utilies";
import globalUtils from "../../utilies/globals";
import { AuthRouter } from "./auth.route";
import { JWT_PAYLOAD } from "../../types/express";
import crypto from "crypto";
import { v4 } from "uuid";


class AuthControllerClass {
   private service: AuthServiceClass;
   private MAX_REFRESH_TOKENS: number;
   /**
    * @description This is the constructor of the AuthController class
    * @param service - it is instance of the AuthServiceClass, it is used to handle auth with the database
    */
   constructor(service: AuthServiceClass) {
      this.service = service;
      this.MAX_REFRESH_TOKENS = 3;
   }

   /**
    * @description This function is used to login a user
    * @param req - The request object
    * @param res - The response object
    * @param next - The next function
    */
   public Login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { password, accept_cookies } = req.body;
      const user: User = (req as any).user;

      if (user.is_blocked)
         return (next(ApiError.create_error("Your account is blocked", 401)));

      try {
         // companring password with hashed password
         const isMatch = await bcrypt.compare(password, user.password_hash);
         if (!isMatch)
            return (next(ApiError.create_error("Wrong Email or Password!", 401)));

         // in case of success, generate a JWT token for access token
         const access_token = auhtUtilies.generate_token(user);

         // in case of user not accept cookies, send the response
         if (!accept_cookies)
            return (globalUtils.SuccessfulyResponseJson(res, 200, "Login successful", { ...user, access_token }));

         // removing all refresh token in case of max refresh tokens
         if (await this.service.refreshTokenCounter(user.id) >= this.MAX_REFRESH_TOKENS)
            await this.service.removeAllRefreshTokens(user.id);

         // creating refresh token in case of user accept cookies and remember me
         const refresh_token = crypto.randomBytes(64).toString("hex");
         const encrypted_token = await bcrypt.hash(refresh_token, 10);
         const refresh_token_record = await this.service.createRefreshToken(user.id, encrypted_token);

         if (!refresh_token_record)
            return (next(ApiError.create_error("Failure from the server", 500)));

         await this.service.removeAllRefreshTokensExpired(user.id);

         // set cookies in admin pannel (access token && refresh token)
         // tokenID.tokenEncrypted
         const refresh_token_client = `${refresh_token_record.id}.${refresh_token}`;
         auhtUtilies.set_cookies(res, access_token, refresh_token_client);

         // send the response
         return (globalUtils.SuccessfulyResponseJson(res, 200, "Login successful", { ...user, access_token, refresh_token: { ...refresh_token_record, token: refresh_token } }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   /**
    * @description This function is used to register a user
    * @param req - The request object
    * @param res - The response object
    * @param next - The next function
    */
   public Register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { first_name, last_name, email, password, phone_number_user } = req.body;
      const { company_name, origin, website_url, phone_number_company, fax_number, address_company, city_company, country_company } = req.body;
      const { auth_letter_public_id } = (req as any);

      try {
         // creating the user in out records before creating the company
         const user = await this.service.createUser({ first_name, last_name, email, password, phone_number_user });

         // creating the company in our records
         await this.service.createCompany({ company_name, origin, website_url, phone_number_company, fax_number, address_company, city_company, country_company }, auth_letter_public_id, user.id);

         return (globalUtils.SuccessfulyResponseJson(res, 201, "Register successful"));
      } catch (err) {
         console.log(err)
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   /**
 * @description This function is used to send a OTP code to the user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
   public SendOtpCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user: User = (req as any).user;

      try {
         const otp_code = auhtUtilies.generate_otp_code();

         const otp_code_record = await this.service.updateUserOtpCode(user.id, otp_code);

         await globalUtils.SendMail(user.email, "استخدم رمز التحقق الآتي لإعادة تعيين كلمة المرور", auhtUtilies.html_code_for_otp_code(otp_code, otp_code_record.otp_code_expires_at as Date))

         return (globalUtils.SuccessfulyResponseJson(res, 200, "OTP code sent to the user"));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   /**
 * @description This function is used to verify a OTP code
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
   public VerifyOtpCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user: User = (req as any).user;
      const { otp_code } = req.body;
      const current_date = new Date();

      try {
         const otp_code_record = await this.service.getUserOtpCode(user.id);

         if (!otp_code_record || !otp_code_record.otp_code_hash || !otp_code_record.otp_code_expires_at)
            return (next(ApiError.create_error("OTP code not found", 404)));

         if (otp_code_record.otp_code_expires_at < current_date)
            return (next(ApiError.create_error("OTP code expired, Request a new one", 401)));

         const isMatch = await bcrypt.compare(otp_code, otp_code_record.otp_code_hash);
         if (!isMatch)
            return (next(ApiError.create_error("Invalid OTP code", 401)));

         const verified_otp_code_record = await this.service.verifyUserOtpCode(user.id, otp_code);

         if (!verified_otp_code_record)
            return (next(ApiError.create_error("OTP code verification failed", 401)));

         return (globalUtils.SuccessfulyResponseJson(res, 200, "OTP code verified"));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   /**
    * @description This function is used to reset the password
    * @param req - The request object
    * @param res - The response object
    * @param next - The next function
    */
   public ResetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user: User = (req as any).user;
      const { new_password } = req.body;

      try {
         const otp_code_record = await this.service.getUserOtpCode(user.id);

         if (!otp_code_record || !otp_code_record.otp_code_hash || !otp_code_record.otp_code_expires_at)
            return (next(ApiError.create_error("OTP code not found", 404)));

         if (!otp_code_record.is_verified)
            return (next(ApiError.create_error("OTP code not verified", 401)));


         await this.service.updateUserPassword(user.id, new_password);

         await this.service.removeUserOtpCode(user.id);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Password reset successful"));
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
      const payload: JWT_PAYLOAD = (req as any).payload;
      const { refresh_token } = req.cookies;
      const [tokenID, token] = refresh_token.split(".");

      try {
         const refresh_token_record = await this.service.getRefreshTokenByUserTokenId(tokenID, payload.user_id);

         if (!refresh_token_record)
            return (next(ApiError.create_error("Refresh token not found", 404)));

         if (refresh_token_record.revoked)
            return (next(ApiError.create_error("Refresh token revoked", 401)));

         await this.service.removeRefreshToken(refresh_token_record.id, payload.user_id);

         res.clearCookie("refresh_token");
         res.clearCookie("access_token");

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Logout successful"));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   /**
    * @description This function is used to refresh the token
    * @param req - The request object
    * @param res - The response object
    * @param next - The next function
    */
   public RefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { refresh_token } = req.cookies;
      const [tokenID, token] = refresh_token.split(".");

      try {
         const refresh_token_record = await this.service.getUserRefreshTokenByTokenID(tokenID);

         if (!refresh_token_record)
            return (next(ApiError.create_error("Refresh token not found", 404)));

         const isMatch = await bcrypt.compare(token, refresh_token_record.token);
         if (!isMatch)
            return (next(ApiError.create_error("Invalid refresh token", 401)));

         if (refresh_token_record.revoked)
            return (next(ApiError.create_error("Refresh token revoked", 401)));

         if (refresh_token_record.expires_at < new Date()) {
            await this.service.removeRefreshToken(refresh_token_record.token, refresh_token_record.user_id);
            return (next(ApiError.create_error("Refresh token expired, Please login again", 401)));
         }

         const user = await this.service.getUserById(refresh_token_record.user_id);

         if (!user)
            return (next(ApiError.create_error("User not found", 404)));

         if (user.is_blocked)
            return (next(ApiError.create_error("Forbiden, contact with the management!", 403)));

         const access_token = auhtUtilies.generate_token(user);

         res.cookie("access_token", `Bearer ${access_token}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1 * 60 * 60 * 1000, // 1 hour
         });

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Token refreshed", { ...user, access_token, refresh_token }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   /**
    * @description Controller function that check if the user authinticated,
    *             - get user data from cache, if not exists get from db
    *             - then store it in cache
    * @param req - The request object
    * @param res - The response object
    * @param next - The next function
    */
   public IsAuthinticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const payload: JWT_PAYLOAD = (req as any).payload;

      try {
         const user_redis = await this.service.getUserByIdRedis(payload.user_id);

         if (user_redis) {
            const parse_user_redis = JSON.parse(user_redis);
            if (parse_user_redis.is_blocked)
               return (next(ApiError.create_error("Unauthorized, please contact with the management!", 401)));

            return (globalUtils.SuccessfulyResponseJson(res, 200, "successfuly retreived user data from Cache!", { ...parse_user_redis }));
         }

         const user = await this.service.getUserById(payload.user_id);
         if (!user)
            return (next(ApiError.create_error("Invalid user information, Contact with the management!", 404)));

         if (user.is_blocked)
            return (next(ApiError.create_error("Forbiden, contact with the management!", 403)));

         await this.service.addUserToRedisById(user);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "successfuly retreived user data from DB!", { ...user }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

/**
 * @description This is the instance of the AuthController class
 */
const authController = new AuthControllerClass(authService);

export { authController, AuthControllerClass };
