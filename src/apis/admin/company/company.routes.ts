#!/usr/bin/env node
import { Router } from "express";
import adminCompanyController from "./company.controller";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";
import ApiError from "../../../middlewares/error.handler";
import adminCompanyValidator from "./company.validator";

const AdminCompanyRoutes: Router = Router();

AdminCompanyRoutes.use(verifyAdminToken, isAdminAccount);

/**
 * @swagger
 * /api/v1/admin/company/:
 *   get:
 *     summary: Get paginated/filterable list of companies
 *     tags: [Admin Company]
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
 *         name: verified
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         required: false
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: min_amount_purcahsed
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: max_amount_purcahsed
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, total_amount_purchased, name]
 *         required: false
 *     responses:
 *       200:
 *         description: List of companies
 */
AdminCompanyRoutes.route("/") // --> its contains some query! (?filteration process)
   .get(
      adminCompanyValidator.companyListFilterationValid(), ApiError.validation_error,
      adminCompanyController.CompaniesList
   )

/**
 * @swagger
 * /api/v1/admin/company/{company_id}/verify/:
 *   put:
 *     summary: Verify or reject a company
 *     tags: [Admin Company]
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [verified]
 *             properties:
 *               verified:
 *                 type: string
 *                 enum: [accept, rejected]
 *     responses:
 *       200:
 *         description: Company verified or rejected
 */
AdminCompanyRoutes.route("/:company_id/verify/")
   .put(
      adminCompanyValidator.companyParamIDValidDB(), ApiError.validation_error,
      adminCompanyController.VerifyCompanyAccount
   )

/**
 * @swagger
 * /api/v1/admin/company/{company_id}/block/:
 *   put:
 *     summary: Block or unblock a company
 *     tags: [Admin Company]
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [block]
 *             properties:
 *               block:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Company blocked/unblocked
 */
AdminCompanyRoutes.route("/:company_id/block/")
   .put(
      adminCompanyValidator.blockCompanyAccValid(), ApiError.validation_error,
      adminCompanyController.BlockCompanyAccount
   )

/**
 * @swagger
 * /api/v1/admin/company/{company_id}/auth-letter/:
 *   get:
 *     summary: Get company authorization letter
 *     tags: [Admin Company]
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company authorization letter
 */
AdminCompanyRoutes.route("/:company_id/auth-letter/")
   .get(
      adminCompanyValidator.companyParamIDValidDB(), ApiError.validation_error,
      adminCompanyController.CompanyAuthLetter
   )

/**
 * @swagger
 * /api/v1/admin/company/{company_id}/wallet/:
 *   put:
 *     summary: Update company wallet
 *     tags: [Admin Company]
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type]
 *             properties:
 *               amount:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [add, subtract]
 *     responses:
 *       200:
 *         description: Company wallet updated
 */
AdminCompanyRoutes.route("/:company_id/wallet/")
   .put(
      adminCompanyValidator.updateCompanyWalletValid(), ApiError.validation_error,
      adminCompanyController.UpdateCompanyWallet
   )

/**
 * @swagger
 * /api/v1/admin/company/wallets/:
 *   get:
 *     summary: Get all company wallets
 *     tags: [Admin Company]
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
 *         name: min_balance
 *         schema:
 *           type: number
 *         required: false
 *       - in: query
 *         name: max_balance
 *         schema:
 *           type: number
 *         required: false
 *     responses:
 *       200:
 *         description: List of company wallets
 */
AdminCompanyRoutes.route("/wallets/")
   .get(
      adminCompanyValidator.getAllCompanyWalletsValidWithFilter(), ApiError.validation_error,
      adminCompanyController.GetAllCompanyWallets
   )

export default AdminCompanyRoutes;
