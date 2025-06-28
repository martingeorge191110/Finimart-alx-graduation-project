#!/usr/bin/env ts-node
import { body, cookie, Meta, ValidationChain } from "express-validator";
import { authService, AuthServiceClass } from "./auth.service";
import { User } from "../../../generated/prisma";


class AuthValidationClass {
   private service: AuthServiceClass;
   /**
    * @description This is the constructor of the AuthController class
    * @param service - it is instance of the AuthServiceClass, it is used to handle auth with the database
    */
   constructor (service: AuthServiceClass) {
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
