import mongoose from "mongoose";
const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        productId: { type: mongoose.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        title: { type: String, required: true },
      },
    ],

    phoneNumbers: {
      type: [
        {
          type: String,
          required: true,
        },
      ],
      required: true,
    },

    shippingAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    finalPrice: {
      //final price after using coupons
      type: Number,
      required: true,
    },
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: "Coupon",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Stripe", "Paymob"],
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Delivered", "Paid", "Placed", "Cancelled"],
      default: "Pending",
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
      required: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
      required: true,
    },
    deliveredAt: {
      type: String,
    },
    deliveredBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
const orderModel = new mongoose.model("Order", orderSchema);
export default orderModel;
