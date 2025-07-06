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
   /**
    * The authentication service instance used for database operations
    * @private
    * @type {typeof authService}
    */
   private service;

   /**
    * Creates an instance of AdminAuthValidatorClass
    * Initializes the service property with the authService dependency
    *
    * @constructor
    */
   constructor() {
      this.service = AdminAuthService;
   }

   /**
    * Creates validation chains for admin login credentials
    *
    * Validates both email and password fields with the following rules:
    * - Email: Required, valid email format, 10-55 characters, must exist in database
    * - Password: Required, 10-55 characters
    *
    * @public
    * @method loginValid
    * @returns {ValidationChain[]} Array of validation chains for email and password
    *    *
    * @throws {Error} Throws "Wrong email or password!" if admin email not found
    * @throws {Error} Re-throws any database errors encountered during validation
    *
    * @description
    * Email validation includes:
    * - Trims whitespace
    * - Checks if field is not empty
    * - Validates email format using built-in validator
    * - Ensures length is between 10-55 characters
    * - Custom validation that queries database to verify admin exists
    * - Sets status_code to 404 and attaches admin object to request if found
    *
    * Password validation includes:
    * - Trims whitespace
    * - Checks if field is not empty
    * - Ensures length is between 10-55 characters
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

/**
 * Default export instance of AdminAuthValidatorClass
 *
 * Pre-instantiated validator object ready for use in route definitions.
 * This singleton pattern ensures consistent validation behavior across the application.
 *
 * @constant AdminAuthValidator
 * @type {AdminAuthValidatorClass}
 * */
const AdminAuthValidator = new AdminAuthValidatorClass();
export default AdminAuthValidator;
