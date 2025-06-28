#!/usr/bin/env ts-node
import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger";

const ApiV1Router: Router = Router();

// Serve Swagger documentation with authentication
ApiV1Router.use("/", swaggerUi.serve);
ApiV1Router.get("/docs-url", swaggerUi.setup(swaggerSpec));


export default ApiV1Router;
