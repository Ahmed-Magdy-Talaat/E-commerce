import { Router } from "express";
import { fileUpload } from "../../utils/fileUpload.js";
import * as orderControllers from "./order.controllers.js";
import { verifyAuthenication } from "../../middlewares/authenication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { validate } from "../../utils/validation.js";
// import { addorderSchema, updateorderSchema } from "./order.validationSchema.js";

const router = Router();
router.post("/", verifyAuthenication, orderControllers.createOrder);

router.post("/cart", verifyAuthenication, orderControllers.convertCartToOrder);

// router.put(
//   "/:id",
//   verifyAuthenication,
//   validate(updateorderSchema),
//   orderControllers.updateorder
// );

// router.get(
//   "/:productId",
//   verifyAuthenication,
//   orderControllers.getordersForProduct
// );

export default router;
