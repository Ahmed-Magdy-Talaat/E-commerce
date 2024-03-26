import { Router } from "express";
import * as subcategoryControllers from "./subcategory.controllers.js";
import { verifyAuthenication } from "../../middlewares/authenication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { fileUpload } from "../../utils/fileUpload.js";
import { validate } from "../../utils/validation.js";
import * as subcategorySchema from "./subcategory.schemaValidation.js";
const router = Router({ mergeParams: true });
router.post(
  "/",
  verifyAuthenication,
  isAuthorized("admin"),
  fileUpload().single("image"),
  validate(subcategorySchema.subcategory),
  subcategoryControllers.addSubcategory
);

router.get(
  "/",
  verifyAuthenication,
  isAuthorized("admin"),
  subcategoryControllers.getAllSubforCategory
);
router.put(
  "/:id",
  verifyAuthenication,
  isAuthorized("admin"),
  fileUpload().single("image"),
  subcategoryControllers.updateSubcategory
);
router.delete(
  "/:id",
  verifyAuthenication,
  isAuthorized("admin"),
  subcategoryControllers.deleteSubcategory
);
export default router;
