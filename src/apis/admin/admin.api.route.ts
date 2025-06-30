#!/usr/bin/env node
import { Router } from "express";
import AdminAuthRoute from "./auth/auth.admin.route";
import CategoryRoutes from "./categories/category.routes";
import BrandsRoutes from "./brands/brands.routes";
import DashboardRoutes from "./dashboard/dashboard.routes";
import AdminUsersRouter from "./users/users.route";



const AdminAPIRoute: Router = Router();

AdminAPIRoute.use("/auth", AdminAuthRoute);

AdminAPIRoute.use("/category", CategoryRoutes);

AdminAPIRoute.use("/brands", BrandsRoutes);

AdminAPIRoute.use("/dashboard", DashboardRoutes);

AdminAPIRoute.use('/users', AdminUsersRouter);

export default AdminAPIRoute;
