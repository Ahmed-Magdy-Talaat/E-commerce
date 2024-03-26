import userModel from "../../DB/models/user.model";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllUsersOrByRoles = asyncHandler(async (req, res, next) => {
  //first check the req.body
  const { role } = req.body;
  let users = [];

  //check for the role and get the users if role not found get all users else get users by roles
  if (role == undefined) users = await userModel.find({});
  else users = await userModel.find({ role });

  //check if the array of users is empty
  if (!users) return next(new Error("No users are found", { cause: 404 }));

  //return all users
  res.status(200).json({
    success: true,
    users,
  });
});

