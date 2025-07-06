import { Router } from "express";
import favouriteController from "./favourite.controller";
import { verifyToken } from "../../middlewares/verify.token";
import FavouriteValidationClass from "./favourite.validation";
import ApiError from "../../middlewares/error.handler";

const FavouriteRoutes: Router = Router();
const { NewFavourite, GetFavorutiesPaginated, DeleteFavouriteByID } = favouriteController;
const { newFavouriteValid, favoruitesPaginatedValid, deleteFavouriteValid } = FavouriteValidationClass.getInstance();

FavouriteRoutes.use(verifyToken);

/**
 * @swagger
 * /api/v1/favourites:
 *   post:
 *     summary: Add product to favourites
 *     description: Add a product to the user's favourites list. Cannot add duplicate products.
 *     tags: [Favourites]
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
 *                 description: Product UUID to add to favourites
 *     responses:
 *       201:
 *         description: Product added to favourites successfully
 *       400:
 *         description: Product already in favourites or validation error
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get paginated favourites
 *     description: Retrieve paginated list of user's favourite products.
 *     tags: [Favourites]
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
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Favourites retrieved successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
//    creating a new favourite
//    POST: data body: { product_id: string }
//    GET: query: { page?: number, limit?: number }
FavouriteRoutes.route("/")
   .post(
      newFavouriteValid(), ApiError.validation_error, NewFavourite
   )
   .get(
      favoruitesPaginatedValid(), ApiError.validation_error, GetFavorutiesPaginated
   );

/**
 * @swagger
 * /api/v1/favourites/{id}:
 *   delete:
 *     summary: Remove product from favourites
 *     description: Delete a specific favourite product. Only the owner can delete it.
 *     tags: [Favourites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Favourite product UUID
 *     responses:
 *       200:
 *         description: Product removed from favourites successfully
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Server error
 */
//   deleting a favourite by ID
//   DELETE: params: { id: string }
FavouriteRoutes.route("/:id/")
   .delete(
      deleteFavouriteValid(), ApiError.validation_error, DeleteFavouriteByID
   );

export default FavouriteRoutes;
