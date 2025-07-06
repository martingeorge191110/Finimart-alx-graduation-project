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

AdminUsersRouter.route('/:user_id/')
   .delete(
      AdminUsersValidator.userIDParamValid(), ApiError.validation_error,
      AdminUsersController.DeleteUser
   )

AdminUsersRouter.route('/:user_id/')
   .put(
      AdminUsersValidator.userIDParamValid(), AdminUsersValidator.updateUserValid(),
      ApiError.validation_error, AdminUsersController.UpdateUserInfoByID
   )

AdminUsersRouter.route('/:user_id/block/')
   .patch(
      AdminUsersValidator.userIDParamValid(), ApiError.validation_error,
      AdminUsersController.blockUser
   )

export default AdminUsersRouter;
