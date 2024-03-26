import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 25,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
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
  }
);
const subCategoryModel = new mongoose.model("Subcategory", subCategorySchema);
export default subCategoryModel;
