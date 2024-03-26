import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      min: 2,
      max: 25,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    categoryId: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategoryId: {
      type: mongoose.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    brandId: {
      type: mongoose.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    coverImage: {
      type: {
        id: String,
        url: String,
      },
      required: true,
    },
    productImages: [
      {
        id: String,
        url: String,
      },
    ],
    specs: [
      {
        key: String,
        value: { type: String, required: true },
      },
    ],
    addedBy: {
      type: String,
      ref: "User",
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
    },
    stock: { type: Number, required: true, min: 1 },
    rate: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

productSchema.virtual("estimatedPrice").get(function () {
  return (this.basePrice * (100 - this.discount)) / 100;
});
const productModel = new mongoose.model("product", productSchema);
export default productModel;
