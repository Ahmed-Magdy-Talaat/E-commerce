import { Router } from "express";
import { fileUpload } from "../../utils/fileUpload.js";
import * as productControllers from "./product.controllers.js";
import { verifyAuthenication } from "../../middlewares/authenication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { updateProductSchema } from "./product.schemaValidation.js";
import { productValidationSchema } from "./product.schemaValidation.js";
import { validate } from "../../utils/validation.js";

const router = Router();
router.post(
  "/",
  verifyAuthenication,
  isAuthorized("admin"),
  fileUpload().fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  validate(productValidationSchema),
  productControllers.addProduct
);

router.get("/all", verifyAuthenication, productControllers.getAllProducts);

router.get("/:id", verifyAuthenication, productControllers.getSpecificProduct);

router.delete(
  "/:id",
  verifyAuthenication,
  isAuthorized("admin", "seller"),
  productControllers.deleteProduct
);

router.put(
  "/:id",
  verifyAuthenication,
  isAuthorized("admin", "seller"),
  fileUpload().fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  validate(updateProductSchema),

  productControllers.updateProduct
);
export default router;
