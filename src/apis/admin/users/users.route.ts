#!/usr/bin/env node
import { Router } from "express";
import { verifyAdminToken } from "../../../middlewares/verify.admin.token";
import AdminUsersValidator from "./users.validator";
import ApiError from "../../../middlewares/error.handler";
import AdminUsersController from "./users.controller";


const AdminUsersRouter: Router = Router();

AdminUsersRouter.use( verifyAdminToken );


AdminUsersRouter.route("/")
   .get(
      AdminUsersValidator.getUsersPaginationValid(), ApiError.validation_error,
      AdminUsersController.GetUsersPagination
   )


export default AdminUsersRouter;
