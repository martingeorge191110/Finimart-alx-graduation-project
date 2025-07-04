#!/usr/bin/env node
import { Request, Response, NextFunction } from "express";
import AdminInvoicesService from "./invoices.service";
import globalUtils from "../../../utils/globals";
import ApiError from "../../../middlewares/error.handler";

class AdminInvoicesControllerClass {
    private service;
    constructor () {
        this.service = AdminInvoicesService
    }

    public static createInstance = () => (new AdminInvoicesControllerClass());

    public getAllCompaniesInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const order_no = req.query.order_no ? parseInt(req.query.order_no as string) : undefined;
            const search = req.query.search as string | undefined;
            const startDate = req.query.startDate as string | undefined;
            const endDate = req.query.endDate as string | undefined;
            const sort = (req.query.sort as "asc" | "desc") || "asc";

            const result = await this.service.getAllInvoices(page, limit, order_no, search, startDate, endDate, sort);
            globalUtils.SuccessfulyResponseJson(res, 200, "Successfully Retrieved All Companies Inoices", result);

        } catch (err) {
            next(ApiError.create_error(String(err), 500));
        }
    };
}

const AdminInvoicesController = AdminInvoicesControllerClass.createInstance();
export default AdminInvoicesController;
