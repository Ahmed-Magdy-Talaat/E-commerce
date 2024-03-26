import { Router } from "express";
import { verifyAuthenication } from "../../middlewares/authenication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { fileUpload } from "../../utils/fileUpload.js";
import * as brandControllers from "./brand.controllers.js";
import { brandSchema } from "./brand.schemaValidation.js";
import { validate } from "../../utils/validation.js";

const router = Router();
router.post(
  "/",
  verifyAuthenication,
  isAuthorized("admin"),
  fileUpload().single("image"),
  validate(brandSchema),
  brandControllers.addBrands
);

router.get("/all", verifyAuthenication, brandControllers.getAllBrands);
router.put(
  "/:id",
  verifyAuthenication,
  isAuthorized("admin"),
  fileUpload().single("image"),
  brandControllers.updatebrand
);
router.delete(
  "/:id",
  verifyAuthenication,
  isAuthorized("admin"),
  fileUpload().single("image"),
  brandControllers.deleteBrand
);
export default router;
