import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 25,
    },
    slug: {
      type: String,
      unique: true,
      min: 3,
      max: 25,
    },
    image: {
      id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
categorySchema.virtual("subcategories", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "category",
});
const categoryModel = new mongoose.model("Category", categorySchema);
export default categoryModel;
