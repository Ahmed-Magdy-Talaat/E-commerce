import mongoose from "mongoose";

const couponUserSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    usedCouponsByUser: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const couponUserModel = new mongoose.model("CouponUser", couponUserSchema);
export default couponUserModel;
