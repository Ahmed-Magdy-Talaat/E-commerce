import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
          },
          quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
          },
          priceForOne: {
            type: Number,
            required: true,
            default: 0,
          },
          finalPrice: {
            //basePrice * quantity
            type: Number,
            required: true,
          },
          title: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    subTotal: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const cartModel = new mongoose.model("Cart", cartSchema);
export default cartModel;
