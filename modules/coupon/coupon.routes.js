import { Router } from "express";
import { fileUpload } from "../../utils/fileUpload.js";
import * as couponControllers from "./coupon.controllers.js";
import { verifyAuthenication } from "../../middlewares/authenication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { addCoupon, updateCoupon } from "./coupon.schemaValidation.js";
import { validate } from "../../utils/validation.js";

const router = Router();

router.post(
  "/",
  verifyAuthenication,
  isAuthorized("admin"),
  validate(addCoupon),
  couponControllers.addCoupon
);

router.delete(
  "/",
  verifyAuthenication,
  isAuthorized("admin"),
  couponControllers.deleteCoupon
);

router.put(
  "/:id",
  verifyAuthenication,
  isAuthorized("admin"),
  validate(updateCoupon),
  couponControllers.updateCoupon
);
export default router;
