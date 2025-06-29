#!/usr/bin/env ts-node
import { body, cookie, Meta, ValidationChain } from "express-validator";
import { authService, AuthServiceClass } from "./auth.service";
import { Company, User } from "../../../generated/prisma";


class AuthValidationClass {
   private service: AuthServiceClass;
   /**
    * @description This is the constructor of the AuthController class
    * @param service - it is instance of the AuthServiceClass, it is used to handle auth with the database
    */
   constructor(service: AuthServiceClass) {
      this.service = service;
   }

   /**
    * @description This function is used to validate the login request
    * @returns The validation chains
    */
   public loginValidation = (): ValidationChain[] => {
      return ([
         body("email")
            .trim().notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid")
            .isLength({ min: 10, max: 200 }).withMessage("Email must be between 1 and 200 characters")
            .custom(async (val: string, { req }: Meta): Promise<void | boolean> => {
               const user: (User | null) = await this.service.getUserByEmail(val);

               if (!user) {
                  (req as any).status_code = 404;
                  throw (new Error("User not found"))
               };

               (req as any).user = user;
               return (true);
            }),
         body("password")
            .trim().notEmpty().withMessage("Password is required")
            .isLength({ min: 8, max: 200 }).withMessage("Password must be between 8 and 200 characters"),
         body("accept_cookies")
            .trim().notEmpty().withMessage("Accept cookies is required")
            .isBoolean().withMessage("Accept cookies must be a boolean")
      ])
   }

   /**
 * @description This function is used to validate the register request
 * @returns The validation chains
 */
   public registerValidation = (): ValidationChain[] => {
      return ([
         ...this.userRegisterValidation(),
         ...this.companyRegisterValidation()
      ])
   }

   /**
    * @description This function is used to validate the user register request
    * @returns The validation chains
    */
   private userRegisterValidation = (): ValidationChain[] => {
      return ([
         body("first_name")
            .trim().notEmpty().withMessage("First name is required")
            .isLength({ min: 3, max: 50 }).withMessage("First name must be between 3 and 50 characters"),
         body("last_name")
            .trim().notEmpty().withMessage("Last name is required")
            .isLength({ min: 3, max: 50 }).withMessage("Last name must be between 3 and 50 characters"),
         body("email")
            .trim().notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid")
            .isLength({ min: 10, max: 200 }).withMessage("Email must be between 1 and 200 characters")
            .custom(async (val: string, { req }: Meta): Promise<void | boolean> => {
               const user: (User | null) = await this.service.getUserByEmail(val);

               if (user)
                  throw (new Error("Email already exists"));

               return (true);
            }),
         body("password")
            .trim().notEmpty().withMessage("Password is required")
            .isLength({ min: 8, max: 200 }).withMessage("Password must be between 8 and 200 characters"),
         body("confirm_password")
            .trim().notEmpty().withMessage("Confirm password is required")
            .isLength({ min: 8, max: 200 }).withMessage("Confirm password must be between 8 and 200 characters")
            .custom((val: string, { req }: Meta): void | boolean => {
               if (val !== (req as any).body.password) {
                  throw (new Error("Passwords do not match"));
               }
               return (true);
            }),
         body("phone_number_user")
            .trim().notEmpty().withMessage("Phone number is required")
            .isMobilePhone("ar-EG").withMessage("Phone number is invalid")
            .isLength({ min: 10, max: 15 }).withMessage("Phone number must be between 10 and 15 characters"),
      ])
   }

   /**
    * @description This function is used to validate the company register request
    * @returns The validation chains
    */
   private companyRegisterValidation = (): ValidationChain[] => {
      return ([
         body("company_name")
            .trim().notEmpty().withMessage("Company name is required")
            .isLength({ min: 3, max: 50 }).withMessage("Company name must be between 3 and 50 characters"),
         body("origin")
            .trim().notEmpty().withMessage("Origin is required")
            .isLength({ min: 3, max: 50 }).withMessage("Origin must be between 3 and 50 characters"),
         body("website_url")
            .optional()
            .isURL().withMessage("Website URL is invalid")
            .isLength({ min: 10, max: 200 }).withMessage("Website URL must be between 10 and 200 characters"),
         body("phone_number_company")
            .trim().notEmpty().withMessage("Phone number is required")
            .isMobilePhone("ar-EG").withMessage("Phone number is invalid")
            .isLength({ min: 10, max: 15 }).withMessage("Phone number must be between 10 and 15 characters")
            .custom(async (val: string, { req }: Meta): Promise<void | boolean> => {
               const company: (Company | null) = await this.service.getCompanyByPhoneNumber(val);

               if (company)
                  throw (new Error("This Company already exists with same phone number"));

               return (true);
            }),
         body("fax_number")
            .optional()
            .isLength({ min: 10, max: 15 }).withMessage("Fax number must be between 10 and 15 characters"),
         body("address_company")
            .trim().notEmpty().withMessage("Address is required")
            .isLength({ min: 3, max: 50 }).withMessage("Address must be between 3 and 50 characters"),
         body("city_company")
            .trim().notEmpty().withMessage("City is required")
            .isLength({ min: 3, max: 50 }).withMessage("City must be between 3 and 50 characters"),
         body("country_company")
            .trim().notEmpty().withMessage("Country is required")
            .isLength({ min: 3, max: 50 }).withMessage("Country must be between 3 and 50 characters")
      ])
   }

   /**
    * @description This function is used to validate the send OTP code request
    * @returns The validation chains
    */
   public sendOtpCodeValidation = (): ValidationChain[] => {
      return ([
         body("email")
            .trim().notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid")
            .isLength({ min: 10, max: 200 }).withMessage("Email must be between 1 and 200 characters")
            .custom(async (val: string, { req }: Meta): Promise<void | boolean> => {
               try {
                  const user: (User | null) = await this.service.getUserByEmail(val);

                  if (!user) {
                     (req as any).status_code = 404;
                     throw (new Error("User not found"));
                  }

                  (req as any).user = user;
                  return (true);
               } catch (err) {
                  throw (err);
               }
            })
      ])
   }

   /**
 * @description This function is used to validate the verify OTP code request
 * @returns The validation chains
 */
   public verifyOtpCodeValidation = (): ValidationChain[] => {
      return ([
         body("email")
            .trim().notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid")
            .isLength({ min: 10, max: 200 }).withMessage("Email must be between 1 and 200 characters")
            .custom(async (val: string, { req }: Meta): Promise<void | boolean> => {
               try {
                  const user: (User | null) = await this.service.getUserByEmail(val);

                  if (!user) {
                     (req as any).status_code = 404;
                     throw (new Error("User not found"));
                  }

                  (req as any).user = user;
                  return (true);
               } catch (err) {
                  throw (err);
               }
            }),
         body("otp_code")
            .trim().notEmpty().withMessage("OTP code is required")
            .isLength({ min: 6, max: 6 }).withMessage("OTP code must be 6 characters")
      ])
   }


   /**
    * @description This function is used to validate the reset password request
    * @returns The validation chains
    */
   public resetPasswordValidation = (): ValidationChain[] => {
      return ([
         body("email")
            .trim().notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid")
            .isLength({ min: 10, max: 200 }).withMessage("Email must be between 1 and 200 characters")
            .custom(async (val: string, { req }: Meta): Promise<void | boolean> => {
               try {
                  const user: (User | null) = await this.service.getUserByEmail(val);

                  if (!user) {
                     (req as any).status_code = 404;
                     throw (new Error("User not found"));
                  }

                  (req as any).user = user;
                  return (true);
               } catch (err) {
                  throw (err);
               }
            }),
         body("new_password")
            .trim().notEmpty().withMessage("New password is required")
            .isLength({ min: 8, max: 50 }).withMessage("New password must be between 8 and 50 characters"),
         body("confirm_new_password")
            .trim().notEmpty().withMessage("Confirm new password is required")
            .isLength({ min: 8, max: 50 }).withMessage("Confirm new password must be between 8 and 50 characters")
            .custom((val: string, { req }: Meta): void | boolean => {
               if (val !== (req as any).body.new_password) {
                  throw (new Error("Passwords do not match"));
               }
               return (true);
            }),
      ])
   }

   /**
    * @description This function is used to validate the logout request
    * @returns The validation chains
    */
   public refreshTokenValidation = (): ValidationChain[] => {
      return ([
         cookie("refresh_token")
            .trim().notEmpty().withMessage("Refresh token is required")
            .isLength({ min: 10, max: 80 }).withMessage("Refresh token must be between 10 and 80 characters")
      ])
   }
}

const authValidation = new AuthValidationClass(authService);

export { authValidation, AuthValidationClass };
