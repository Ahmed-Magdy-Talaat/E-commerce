import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      url: {
        type: String,
      },
      id: {
        type: String,
      },
    },
    coverImages: [
      {
        url: {
          type: String,
        },
        id: {
          type: String,
        },
      },
    ],
    address: {
      type: String,
    },
    phone: String,
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.signAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET);
};
userSchema.methods.signRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET);
};
const userModel = mongoose.model("User", userSchema);
export default userModel;
