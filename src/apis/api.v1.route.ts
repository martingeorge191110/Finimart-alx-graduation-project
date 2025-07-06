#!/usr/bin/env ts-node
import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger";
import AdminAPIRoute from "./admin/admin.api.route";
import { AuthRouter } from "./auth/auth.route";
import ProductRoutes from "./products/products.routes";
import FavouriteRoutes from "./favourites/favourite.routes";
import CartRouter from "./cart/cart.routes";
import CategoryRoutes from "./categories/category.routes";
import OrderRoutes from "./orders/order.routes";
import CompanyRoutes from "./company/company.routes";

const ApiV1Router: Router = Router();

// Serve Swagger documentation with authentication
ApiV1Router.use("/", swaggerUi.serve);
ApiV1Router.get("/docs-url", swaggerUi.setup(swaggerSpec));

ApiV1Router.use('/admin', AdminAPIRoute);

ApiV1Router.use('/auth', AuthRouter);

ApiV1Router.use('/category', CategoryRoutes)

ApiV1Router.use("/products", ProductRoutes);

ApiV1Router.use("/favourties", FavouriteRoutes)

ApiV1Router.use('/cart', CartRouter);

ApiV1Router.use('/orders', OrderRoutes);

ApiV1Router.use('/company', CompanyRoutes);

export default ApiV1Router;
