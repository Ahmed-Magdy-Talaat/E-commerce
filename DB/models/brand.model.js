import mongoose, { mongo } from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 15,
    },
    slug: {
      type: String,
      required: true,
    },
    subcategory: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: "Subcategory",
        },
      ],
      validate: {
        validator: function (val) {
          return val.length <= 25; // Change the number to the desired maximum length
        },
        message: (props) => `Subcategory array exceeds the maximum length of 5`,
      },
    },
    brandImage: {
      type: {
        id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
      required: true,
    },
    addedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const brandModel = new mongoose.model("Brand", brandSchema);
export default brandModel;
