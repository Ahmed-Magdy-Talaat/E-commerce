import express from "express";
import * as authController from "./auth.controllers.js";
import { verifyAuthenication } from "../../middlewares/authenication.js";
const router = express.Router();
import * as authSchema from "./auth.schemaValidation.js";
import { validate } from "../../utils/validation.js";
router.post(
  "/sign-in",
  validate(authSchema.signInSchema),
  authController.signIn
);
router.post(
  "/sign-up",
  validate(authSchema.signUpSchema),
  authController.signUp
);
router.post(
  "/activate",
  validate(authSchema.activationSchema),
  authController.acivateEmail
);
router.post("/log-out", verifyAuthenication, authController.logOut);
router.post(
  "/forget-pass",
  validate(authSchema.forgetSchema),
  authController.forgetPassword
);
router.patch(
  "/reset-pass",
  validate(authSchema.resetPassSchema),
  authController.resetPassword
);
router.post("/update-tokens", authController.updateTokens);
export default router;
