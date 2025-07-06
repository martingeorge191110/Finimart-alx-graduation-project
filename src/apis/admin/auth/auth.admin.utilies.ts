#!/usr/bin/env node

import { Response } from "express";
// import { JWT_PAYLOAD } from "../../types/express";
import jwt from 'jsonwebtoken';



class AdminAuthUtiliesClass {
   

   /**
    * @description - Function that create an access token
    * @param payload - Token payload
    * @returns - access token
    */
   public create_access_token = (payload: any): string => (
      jwt.sign({ ...payload }, String(process.env.JWT_KEY), { expiresIn: '1h' })
   );

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
}

const AdminAuthUtilies = new AdminAuthUtiliesClass();
export default AdminAuthUtilies;
