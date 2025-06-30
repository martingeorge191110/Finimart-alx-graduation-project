#!/usr/bin/env ts-node
import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger";
import AdminAPIRoute from "./admin/admin.api.route";
import { AuthRouter } from "./auth/auth.route";

const ApiV1Router: Router = Router();

// Serve Swagger documentation with authentication
ApiV1Router.use("/", swaggerUi.serve);
ApiV1Router.get("/docs-url", swaggerUi.setup(swaggerSpec));

ApiV1Router.use('/admin', AdminAPIRoute);

ApiV1Router.use('/auth', AuthRouter);


export default ApiV1Router;
