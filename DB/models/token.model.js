import mongoose from "mongoose";

const tokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    expiresAt: {
      type: Number,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    sessionID: {
      type: String,
    },
    type: {
      type: String,
      enum: ["access", "refresh"],
      required: true,
    },
    agent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const tokenModel = mongoose.model("Token", tokenSchema);
export default tokenModel;
