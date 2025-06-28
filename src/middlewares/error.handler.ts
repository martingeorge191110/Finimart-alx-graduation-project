import { Request, Response, NextFunction } from "express";
import { ValidationError, validationResult } from "express-validator";
import fs from "fs";


/**
 * Custom Error Class for Handling API Errors
 *  This class extends the built-in Error class and provides additional properties
 *  for better error handling in an API context.
 *  It includes properties for status, status code, and validation errors.
 *  It also provides methods for creating different types of errors and a middleware function for handling errors in the Express application.
 * 
 * @extends Error - The built-in Error class
 * @property {string} status - The status of the error (e.g., "Failure" or "Error")
 * @property {number} status_code - The HTTP status code associated with the error
 * @property {ValidationError[] | null} errors - An array of validation errors, if any
 * @constructor - Creates an instance of ApiError
 */
class ApiError extends Error {
   /**
    * The status of the error (e.g., "Failure" or "Error")
    */
   private status: string;
   /**
    * The HTTP status code associated with the error
    */
   private status_code: number;
   /**
    * An array of validation errors, if any
    */
   private errors: ValidationError[] | null;

   constructor (message: string, errors: ValidationError[] | null, status_code: number = 500) {
      super(message)
      this.status_code = status_code
      this.stack = process.env.NODE_ENV === "development" ? this.stack : ""
      this.status = status_code >= 400 && status_code <= 500 ? "Failuire" : "Error"
      this.errors = errors
   }

   /**
    * Creates a server error with a given message
    * @param message - The error message
    * @returns {ApiError} - An instance of ApiError with the given message
    */
   public static server_error = (message: string): ApiError => {
      return (new ApiError(message, null))
   }

   /**
    * Creates a custom error with a given message and status code
    * @param message - The error message
    * @param status_code - The HTTP status code associated with the error
    * @returns {ApiError} - An instance of ApiError with the given message and status code
    */
   public static create_error = (message: string, status_code: number): ApiError => {
      return (new ApiError(message, null, status_code))
   }

   /**
    * Middleware function for handling errors in the Express application
    * @param error - The error object
    * @param req - The request object
    * @param res - The response object
    * @param next - The next middleware function
    */
   public static error_middleware = (error: ApiError, req: Request, res: Response, next: NextFunction): void => {
      res.status(error.status_code || 500).json({
         success: false,
         message: error.message,
         errors: error.errors,
         stack: process.env.NODE_ENV === "development" ? error.stack : "",
         status: error.status,
      })
   }
}

export default ApiError;
