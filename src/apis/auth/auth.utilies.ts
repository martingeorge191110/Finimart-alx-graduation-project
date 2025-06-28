#!/usr/bin/env ts-node
import { User } from "../../../generated/prisma";
import jwt from "jsonwebtoken";
import { JWT_PAYLOAD } from "../../types/express";
import { Response } from "express";
import otpGenerator from "otp-generator";


/**
 * @description This class contains utility functions for the auth API
 */
class AuthUtiliesClass {

   /**
    * @description This function generates a JWT token for a user
    * @param user - The user object
    * @returns The JWT token
    */
   public generate_token = (user: Partial<User>): string => {
      const payload: Partial<JWT_PAYLOAD> = {
         user_id: user.id,
         user_role: user.user_role,
         is_super_user: user.is_super_user,
         company_id: user.company_id as string,
      }

      return (jwt.sign({
         ...payload
      }, process.env.JWT_KEY as string, { expiresIn: "1h" }));
   }

   /**
    * @description This function sets the cookies for the user
    * @param res - The response object
    * @param access_token - The access token
    * @param refresh_token - The refresh token
    */
   public set_cookies = (res: Response, access_token: string, refresh_token: string): void => {
      res.cookie("access_token", `Bearer ${access_token}`, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         maxAge: 1 * 60 * 60 * 1000, // 1 hour
      });

      res.cookie("refresh_token", refresh_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
   }

   /**
    * @description This function generates a OTP code
    * @returns The OTP code
    */
   public generate_otp_code = (): string => {
      const otp = otpGenerator.generate(6, {
         upperCaseAlphabets: false,
         specialChars: false,
         "digits": true,
         "lowerCaseAlphabets": false
      });

      return (otp);
   }

   public html_code_for_otp_code = (otp_code: string, otp_code_expires_at: Date): string => {
      return (`
         <!DOCTYPE html>
            <html lang="ar" dir="rtl">
               <head>
                  <meta charset="UTF-8">
                     <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        .container { max-width: 600px; margin: 20px auto; padding: 20px; }
                        .logo { text-align: center; margin-bottom: 25px; }
                        .code-box { 
                           background: #f4f4f4;
                           padding: 15px;
                           margin: 20px 0;
                           text-align: center;
                           font-size: 24px;
                           font-weight: bold;
                           border-radius: 5px;
                        }
                        .footer { 
                           margin-top: 30px;
                           text-align: center;
                           color: #666;
                           font-size: 14px;
                        }
                     </style>
               </head>
               <body>
                  <div class="container">
                     <div class="logo">
                        <img src="https://mwasfaa.com/logo.png" alt="Mwasfaa" width="150">
                     </div>
                     <h2 style="color: #2c3e50;">إعادة تعيين كلمة المرور</h2>
                     <p>مرحبًا،</p>
                     <p>استخدم رمز التحقق الآتي لإعادة تعيين كلمة المرور:</p>
                     <div class="code-box">${otp_code}</div>
                     <p>ينتهي صلاحية هذا الرمز في: ${otp_code_expires_at.toLocaleString('ar-EG')}</p>
                     <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.</p>
                     <p>مع تحيات،<br>فريق دعم Mwasfaa</p>
                     <div class="footer">
                        <p>
                           <a href="https://mwasfaa.com" style="color: #3498db;">الموقع الإلكتروني</a> | 
                           <a href="mailto:support@mwasfaa.com" style="color: #3498db;">الدعم الفني</a>
                        </p>
                        <p style="margin-top: 15px;">ⓘ هذه رسالة آلية، لا تقم بالرد عليها</p>
                     </div>
                  </div>
               </body>
            </html>
      `);
   }
}

const auhtUtilies = new AuthUtiliesClass();

export { auhtUtilies, AuthUtiliesClass };
