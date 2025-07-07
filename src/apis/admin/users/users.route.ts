#!/usr/bin/env node
import { Router } from "express";
import { verifyAdminToken } from "../../../middlewares/verify.admin.token";
import AdminUsersValidator from "./users.validator";
import ApiError from "../../../middlewares/error.handler";
import AdminUsersController from "./users.controller";


const AdminUsersRouter: Router = Router();

AdminUsersRouter.use(verifyAdminToken);


/**
 * @swagger
 * /api/v1/admin/users/:
 *   get:
 *     summary: Get paginated/filterable list of users
 *     tags: [Admin Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: search_by_company_name
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: is_super_user
 *         schema:
 *           type: boolean
 *         required: false
 *       - in: query
 *         name: created_at
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *     responses:
 *       200:
 *         description: List of users
 */
AdminUsersRouter.route("/")
   .get(
      AdminUsersValidator.getUsersPaginationValid(), ApiError.validation_error,
      AdminUsersController.GetUsersPagination
   )

/**
 * @swagger
 * /api/v1/admin/users/{user_id}/:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *   put:
 *     summary: Update user info
 *     tags: [Admin Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               is_super_user:
 *                 type: boolean
 *               user_role:
 *                 type: string
 *                 enum: [Controller, Sub_Controller, Order_Maker]
 *     responses:
 *       200:
 *         description: User updated
 */
AdminUsersRouter.route('/:user_id/')
   .delete(
      AdminUsersValidator.userIDParamValid(), ApiError.validation_error,
      AdminUsersController.DeleteUser
   )
   .put(
      AdminUsersValidator.userIDParamValid(), AdminUsersValidator.updateUserValid(),
      ApiError.validation_error, AdminUsersController.UpdateUserInfoByID
   )

/**
 * @swagger
 * /api/v1/admin/users/{user_id}/block/:
 *   patch:
 *     summary: Block or unblock a user
 *     tags: [Admin Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User blocked/unblocked
 */
AdminUsersRouter.route('/:user_id/block/')
   .patch(
      AdminUsersValidator.userIDParamValid(), ApiError.validation_error,
      AdminUsersController.blockUser
   )

export default AdminUsersRouter;
