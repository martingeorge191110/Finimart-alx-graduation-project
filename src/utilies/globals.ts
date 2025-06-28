#!/usr/bin/env ts-node
import { NextFunction, Request, Response } from "express";
import ApiError from "../middlewares/error.handler";
import nodemailer from "nodemailer";


class GlobalUtilies {

   /**
    * @description This function is used to send a success response
    * @param res - The response object
    * @param status - The status code
    * @param message - The message
    * @param data - The data
    */
   public SuccessfulyResponseJson = (res: Response, status: number, message: string, data: any = null): void => {
      if (!data)
         res.status(status).json({
            success: true,
            message: message,
         })
      else
         res.status(status).json({
            success: true,
            message: message,
            data: data
         })
   }

   
/**
 * SendMail - Function that send email with specific contstraints
 * 
 * @userEmail - User email which will send to.
 * @subject - Objective of the email
 * @html_code 
 * @returns 
 */
   public SendMail = async (userEmail: string, subject: string, html_code: string): Promise<boolean | void> => {
   const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
         user: process.env.GMAIL_USER,
         pass: process.env.GMAIL_PASS
      }
   });

   const mail = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: subject,
      html: html_code,
   };

   try {
      await transporter.sendMail(mail);

      return (true);
   } catch (err) {
      const error = err as Error;
      throw (ApiError.create_error(error.message, 500))
   }
}

}

const globalUtils = new GlobalUtilies();

export default globalUtils;
