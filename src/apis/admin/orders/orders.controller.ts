#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import adminOrderService from "./orders.service";
import ApiError from "../../../middlewares/error.handler";
import { OrderByType, OrderStatusType } from "../../../types/admin/orders.admin";
import globalUtils from "../../../utils/globals";
import { OrderPaymentStatus, OrderStatus } from "../../../../generated/prisma";
import adminDashboardService from "../dashboard/dashboard.service";


class AdminOrdersControllerClass {
   private service;

   constructor () {
      this.service = adminOrderService;
   }

   public static createInstance = () => (new AdminOrdersControllerClass());

   public GetOrderPagination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { page, limit, search_by_company, order_by, created_at, status } = req.query;
      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 20;
      const orderByValue: OrderByType = order_by as OrderByType
      const statusValue: OrderStatusType = status as OrderStatusType

      const filteration = {
         search_by_company: search_by_company ? String(search_by_company) : undefined,
         order_by: order_by ? orderByValue : "desc",
         created_at: created_at ? new Date(String(created_at)) : undefined,
         status: status ? statusValue : undefined
      }

      try {
         const {total, orders} = await this.service.getOrdersPaginatedFilterd(pageNumber, limitNumber, filteration);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly Retreived with orders from DB", {orders, total}));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetSpecificOrderDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { order_id } = req.params;

      try {
         const orderDetails = await this.service.getOrderDetailsByID(order_id);
         if (!orderDetails)
            return (next(ApiError.create_error("Order not found", 404)));

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly Retreived Order Details", { ...orderDetails }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }


   public UpdateOrderStatusAndPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { order_id } = req.params;
      const { status, payment_status } = req.body;
      const statusValue: OrderStatus = status as OrderStatus;
      const paymentStatusValue = payment_status ? payment_status as OrderPaymentStatus : undefined;

      try {
         const order = await this.service.getOrderByID(order_id);
         if (!order)
            return (next(ApiError.create_error("Order not found", 404)));
         if (paymentStatusValue && order.payment_status === paymentStatusValue && order.status === statusValue)
            return (next(ApiError.create_error("Order already has this status and payment status", 400)));
         await adminDashboardService.resetStatsCache();
         const updatedOrder = await this.service.updateOrderStatusAndPayment(order_id, statusValue, paymentStatusValue);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Order status and payment status updated successfully", { order: updatedOrder }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

const adminOrderController = AdminOrdersControllerClass.createInstance();
export default adminOrderController;
