#!/usr/bin/env ts-node
import express, { NextFunction, request, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { v4 as uuid } from "uuid";
import { express as useragent } from "express-useragent";
import cookieParser from "cookie-parser";
import ApiError from "./middlewares/error.handler";
import ApiV1Router from "./apis/api.v1.route";
import apiLimiter from "./middlewares/rate.limiter";


dotenv.config();

export const app = express();

const NODE_ENV = String(process.env.NODE_ENV);


app.use(
   cors({
      origin: NODE_ENV === "development" ? "*" : undefined,
      credentials: true,
   })
);

// Request ID --> giving each request an id for logging
app.use((req, res, next) => {
   (req as any).reqId = req.headers["x-request-id"] || uuid();
   next();
});

// Cookie Parser
app.use(cookieParser());

// JSON Parser
app.use(express.json());

// URL Encoded Parser
app.use(
   express.urlencoded({
      limit: "120mgb",
      extended: true,
   })
);

// Morgan Logger
morgan.token("id", (req: Request) => (req as any).reqId);
morgan.token("host", (req: Request) => req.hostname);
morgan.token("remote-addr", (req: Request) => req.ip);
app.use(
   morgan(":id :remote-addr :host :method :url :status :response-time ms")
);

// User Agent
app.use(useragent());

app.use(apiLimiter);

// Main Router Which get all routes for the API version 1
app.use("/api/v1", ApiV1Router);

// Error Handling Middleware
app.use("*", ApiError.error_middleware);

app.all(
   "*",
   (_req: Request, _res: Response, next: NextFunction) => {
      return (next(ApiError.create_error("Invalid Request!", 400)));
   },
   ApiError.error_middleware
);
