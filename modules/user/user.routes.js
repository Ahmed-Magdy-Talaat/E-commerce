import { Router } from "express";
import * as userControllers from "./user.controllers.js";
import { verifyAuthenication } from "../../middlewares/authenication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
const router = Router();

router.get(
  "/users",
  verifyAuthenication,
  isAuthorized("admin"),
  userControllers.getAllUsersOrByRoles
);
