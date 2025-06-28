#!/usr/bin/env node
import { body, cookie, Meta, ValidationChain } from "express-validator";
import { Admin } from "../../../../generated/prisma";
import AdminAuthService from "./auth.admin.service";

/**
 * AdminAuthValidatorClass - Validation logic for authentication endpoints
 *
 * This class provides validation methods for authentication-related operations.
 * It uses express-validator to create validation chains that ensure data integrity
 * and security for admin authentication processes.
 *
 * @class AdminAuthValidatorClass
 */
class AdminAuthValidatorClass {

   private service;

   constructor() {
      this.service = AdminAuthService;
   }

   /**
    * @public
    * @method loginValid
    * @returns {ValidationChain[]} Array of validation chains for email and password
    *    *
    * @throws {Error} Throws "Wrong email or password!" if admin email not found
    * @throws {Error} Re-throws any database errors encountered during validation
    */
   public loginValid = (): ValidationChain[] => {
      return [
         body("email")
            .trim().notEmpty().withMessage("Admin Email is Required!")
            .isEmail().withMessage("This Email is not valid!")
            .isLength({ min: 10, max: 55 }).withMessage("Email address length must between 10 and 55 characters")
            .custom(async (val: string, { req }: Meta): Promise<void | boolean> => {
               try {
                  const admin: Admin | null = await this.service.getUserByEmail(val);

                  if (!admin) {
                     (req as any).status_code = 404;
                     throw new Error("Wrong email or password!");
                  }

                  (req as any).admin = admin;
                  return (true)
               } catch (err) {
                  throw (err);
               }
            }),
         body("password")
            .trim().notEmpty().withMessage("Admin Password is Required!")
            .isLength({ min: 10, max: 55 }).withMessage("Email Password length must between 10 and 55 characters"),
      ];
   };

   public refreshTokenValid = (): ValidationChain[] => [
      cookie("refresh_token")
         .trim().notEmpty().withMessage("Unauthorized")
         .isLength({ min: 10, max: 500 }).withMessage("Refresh token must be between 10 and 500 characters")
   ];
}

const AdminAuthValidator = new AdminAuthValidatorClass();
export default AdminAuthValidator;
