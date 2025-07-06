#!/usr/bin/env node
import { Router } from "express";
import AdminAuthRoute from "./auth/auth.admin.route";
import CategoryRoutes from "./categories/category.routes";
import BrandsRoutes from "./brands/brands.routes";
import AdminProductRoutes from "./products/products.routes";
import AdminCompanyRoutes from "./company/company.routes";
import DashboardRoutes from "./dashboard/dashboard.routes";
import AdminUsersRouter from "./users/users.route";
import AdminSpecsRoutes from "./specsDefination/specs.route";
import AdminOrderRoutes from "./orders/orders.route";
import AdminInvoicesRoutes from "./invoices/invoices.routes";



const AdminAPIRoute: Router = Router();

AdminAPIRoute.use("/auth", AdminAuthRoute);

AdminAPIRoute.use("/dashboard", DashboardRoutes);

AdminAPIRoute.use("/category", CategoryRoutes);

AdminAPIRoute.use("/brands", BrandsRoutes);

AdminAPIRoute.use("/products", AdminProductRoutes);

AdminAPIRoute.use("/companies", AdminCompanyRoutes);

AdminAPIRoute.use("/users", AdminUsersRouter);

AdminAPIRoute.use("/specs-definition", AdminSpecsRoutes);

AdminAPIRoute.use("/orders", AdminOrderRoutes);

AdminAPIRoute.use("/invoices", AdminInvoicesRoutes);

export default AdminAPIRoute;
