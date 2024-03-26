import { Router } from "express";
import * as categoryControllers from "./category.controllers.js";
import { verifyAuthenication } from "../../middlewares/authenication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { fileUpload } from "../../utils/fileUpload.js";
import { validate } from "../../utils/validation.js";
import * as categorySchema from "./category.schemaValidation.js";
import subCategoryRouter from "../subcategory/subcategory.routes.js";
const router = Router();

//routes

router.use("/:categoryId/subcategory", subCategoryRouter);
router.post(
  "/",
  verifyAuthenication,
  isAuthorized("admin"),
  fileUpload().single("image"),
  validate(categorySchema.categorySchema),
  categoryControllers.addCategory
);

router.get("/all", verifyAuthenication, categoryControllers.getAllCategories);
router.put(
  "/:id",
  verifyAuthenication,
  isAuthorized("admin"),
  fileUpload().single("image"),
  categoryControllers.updateCategory
);
router.delete(
  "/:id",
  verifyAuthenication,
  isAuthorized("admin"),
  fileUpload().single("image"),
  categoryControllers.deleteCategory
);
export default router;
