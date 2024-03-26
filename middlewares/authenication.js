import tokenModel from "../DB/models/token.model.js";
import userModel from "../DB/models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyAuthenication = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return next(new Error("user not logged in", { cause: 400 }));
  }
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  const token = await tokenModel.findOne({ token: accessToken });
  if (!token.isValid)
    return next(
      new Error("please , log in to your account to access this resource")
    );

  if (!decoded)
    return next(
      new Error("please try to log in to your account", { cause: 400 })
    );

  const user = await userModel.findById(decoded.id);
  if (!user)
    return next(new Error("please login to your account", { cause: 400 }));
  req.user = user;
  next();
});
