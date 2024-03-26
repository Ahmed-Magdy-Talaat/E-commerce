import { Router } from "express";
import { fileUpload } from "../../utils/fileUpload.js";
import * as cartControllers from "./cart.controllers.js";
import { verifyAuthenication } from "../../middlewares/authenication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { validate } from "../../utils/validation.js";
import {
  addProductToCartSchema,
  deleteProductFromCartSchema,
  updateCartSchema,
} from "./cart.validationSchema.js";

const router = Router();
router.post(
  "/add-product",
  verifyAuthenication,
  validate(addProductToCartSchema),
  cartControllers.addProductToCart
);

router.delete(
  "/delete-product",
  verifyAuthenication,
  validate(deleteProductFromCartSchema),
  cartControllers.deleteProductFromCart
);

router.put(
  "/",
  verifyAuthenication,
  validate(updateCartSchema),
  cartControllers.updateUserCart
);

router.get("/", verifyAuthenication, cartControllers.getUserCart);

router.delete("/", verifyAuthenication, cartControllers.deleteCart);

export default router;
