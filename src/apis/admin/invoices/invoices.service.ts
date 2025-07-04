#!/usr/bin/env node
import { MainDB, ReplicaDB } from "../../../config/db.config";
import redis from "../../../config/redis.config";
import { Prisma } from "../../../../generated/prisma";

class AdminInvoicesServiceClass {
    private configMainDB;
    private configReplicaDB;
    private configRedis;

    constructor () {
        this.configMainDB = MainDB;
        this.configReplicaDB = ReplicaDB;
        this.configRedis = redis;
    }

    public static createInstance = () => (new AdminInvoicesServiceClass());

    public getAllInvoices = async (page: number = 1, limit: number = 20, order_no?: number,
        search?: string, startDate?: string, endDate?: string, sort: "asc" | "desc" = "asc") => {
        try {
            if (page < 1) throw new Error("Page number must be 1 or greater");
            if (limit < 1 || limit > 20) throw new Error("Limit must be between 1 and 20.");

            const where: Prisma.InvoicesWhereInput = {};

            if (startDate || endDate) {
                where.issue_date = {};
                if (startDate) where.issue_date.gte = new Date(startDate);
                if (endDate) where.issue_date.lte = new Date(endDate);
            }

            if (search) {
                where.OR = [
                    {
                        Order: {
                            Company: {
                                name: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                        },
                    },
                ];
            }

            if (order_no) {
                where.Order = { order_no: order_no };
            }

            const totalInvoices = await this.configReplicaDB.invoices.count({ where });

            const invoices = await this.configReplicaDB.invoices.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { issue_date: sort },
                select: {
                    id: true,
                    invoice_number: true,
                    issue_date: true,
                    pdf_url: true,
                    Order: {
                        select: {
                            order_no: true,
                            Company: { select: { name: true } },
                            Created_By: { select: { first_name: true, last_name: true } },
                            Address: { select: { street_address: true } },
                            total_amount: true,
                        },
                    },
                },
            });

            return {
                total: totalInvoices,
                pages: Math.ceil(totalInvoices / limit),
                currentPage: page,
                data: invoices,
            };
        } catch (err) {
            throw err;
        }
    };
}


const AdminInvoicesService = AdminInvoicesServiceClass.createInstance();
export default AdminInvoicesService;
