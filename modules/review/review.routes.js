import { Router } from "express";
import { fileUpload } from "../../utils/fileUpload.js";
import * as reviewControllers from "./review.controllers.js";
import { verifyAuthenication } from "../../middlewares/authenication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { validate } from "../../utils/validation.js";
import {
  addReviewSchema,
  updateReviewSchema,
} from "./review.validationSchema.js";

const router = Router();
router.post(
  "/",
  verifyAuthenication,
  validate(addReviewSchema),
  reviewControllers.addReview
);

router.delete("/:id", verifyAuthenication, reviewControllers.deleteReview);

router.put(
  "/:id",
  verifyAuthenication,
  validate(updateReviewSchema),
  reviewControllers.updateReview
);

router.get(
  "/:productId",
  verifyAuthenication,
  reviewControllers.getReviewsForProduct
);

export default router;
