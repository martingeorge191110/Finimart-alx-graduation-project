#!/usr/bin/env node

import { Meta, ValidationChain, body } from "express-validator";
import orderService from "./order.services";
import { validate as isUUID } from "uuid";
import { SignApiOptions } from "cloudinary";



class OrderValidatorClass {
   private service;

   constructor() {
      this.service = orderService;
   }

   public createOrderValidation = (): ValidationChain[] => ([
      body("address_id")
         .optional()
         .trim().notEmpty().withMessage("Address ID is required")
         .bail()
         .custom(async (val: string, { req }: Meta) => {
            try {
               const address = await this.service.getAddressByID(val);
               if (!address)
                  throw new Error("Address not found");

               (req as any).address = address;
               return (true);
            } catch (err) {
               throw (err);
            }
         })
   ]);
}

const orderValidator = new OrderValidatorClass();
export default orderValidator;
