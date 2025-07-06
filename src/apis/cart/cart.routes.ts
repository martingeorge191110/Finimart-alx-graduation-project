import { Router } from "express";
import CartController from "./cart.controller";
import CartValidation from "./cart.validation";
import { verifyToken } from "../../middlewares/verify.token";
import ApiError from "../../middlewares/error.handler";

const CartRouter: Router = Router();

const { AddCartItem, GetCartItems, DeleteCartItem, UpdateCartItem } = CartController.getInstance();
const { validateCartItem, validateGetCartItems, validateItemID, validateUpdateCartItem } = CartValidation.getInstance()

CartRouter.use(verifyToken);

/**
 * @swagger
 * /api/v1/cart:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product to the cart. Maximum 30 items per company allowed.
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *                 description: Product UUID
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Quantity to add
 *               product_variant_id:
 *                 type: string
 *                 format: uuid
 *                 description: Product variant UUID (optional)
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *       400:
 *         description: Validation error, insufficient quantity, or item already in cart
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get cart items
 *     description: Retrieve paginated cart items for the authenticated company.
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 99
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Cart items retrieved successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
// POST: item in cart, body: { product_id: string, quantity?: number || 1 }
// GET: items in cart, query: { page?: number, limit?: number }
CartRouter.route("/")
   .post(
      validateCartItem(), ApiError.validation_error, AddCartItem
   )
   .get(
      validateGetCartItems(), ApiError.validation_error, GetCartItems
   )

/**
 * @swagger
 * /api/v1/cart/{cart_item_id}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Delete a specific cart item. Only the item owner can delete it.
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cart_item_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cart item UUID
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update cart item quantity
 *     description: Increment or decrement cart item quantity. Cannot decrement below 1.
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cart_item_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cart item UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [increment, decrement]
 *                 description: Action to perform
 *     responses:
 *       200:
 *         description: Quantity updated successfully
 *       400:
 *         description: Validation error or insufficient stock
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
// DELETE: item from cart, param: { cart_item_id: string }
// PATCH: item in cart, param: { cart_item_id: string }, body: { type: "increment" || "decrement" }
CartRouter.route("/:cart_item_id/")
   .delete(
      validateItemID(), ApiError.validation_error, DeleteCartItem
   )
   .patch(
      validateUpdateCartItem(), ApiError.validation_error, UpdateCartItem
   )


export default CartRouter;
