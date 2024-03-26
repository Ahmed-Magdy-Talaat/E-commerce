import categoryModel from "../../DB/models/category.model.js";
import subCategoryModel from "../../DB/models/subcategory.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.config.js";
import slugify from "slugify";

/*  add category
destruct name , slug and image from the req.body
check if the category is already in the DB or not
check if image for category exists 
if true upload it on cloudinary
else give it a default value
create a new instance of category
return a response containing the new category 
*/
export const addCategory = asyncHandler(async (req, res, next) => {
  //   destruct name , slug and image from the req.body
  const { name } = req.body;
  let image;
  const slug = name;
  //check if the category is already in the DB or not
  const isMatched = await categoryModel.findOne({ $or: [{ name }, { slug }] });
  if (isMatched)
    return next(new Error("Category already exists", { cause: 404 }));

  //   check if image for category exists
  // if true upload it on cloudinary
  // else give it a default value
  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/category`,
      }
    );

    image = {
      id: public_id,
      url: secure_url,
    };
  } else {
    image = {
      id: "",
      url: "",
    };
  }
  console.log(image);
  //   create the category and save it in the DB
  const category = await categoryModel.create({
    name,
    slug,
    createdBy: req.user._id,
  });
  console.log(category);

  //   return a response containing the new category
  res.status(200).json({
    success: true,
    category,
  });
});

export const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await categoryModel.find({}).populate("subcategories");
  if (!categories)
    return next(new Error("No categories is found", { cause: 404 }));
  res.status(200).json({
    success: true,
    categories,
  });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findById(id);
  if (!category)
    return next(new Error("category is not found", { cause: 404 }));
  if (category.image && category.image.id) {
    const public_id = category.image.id;
    await cloudinary.uploader.destroy(public_id);
  }
  const deleted = await categoryModel.deleteOne({ _id: id });
  //also we must delete all subcategories related to the category
  const deletedSubcategories = await subCategoryModel.find({ category: id });
  if (!deleted) return next(new Error("something went wrong", { cause: 400 }));
  res.status(200).json({
    success: true,
    message: "category deleted successfully",
  });
});

/****************************updateCategory********************************* */

/*
find the category using its id
check if the image is updated
if updated delete the previous cover image and upload the current image to cloudinary
check if name is updated
if updated check if it is unique or not
save the updated category in the DB
return response with the new category
*/
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;
  let updatedImage;

  // Find the category using its id
  const category = await categoryModel.findById(id);

  // Check if the image is updated
  if (req.file) {
    // If updated, delete the previous cover image and upload the current image to Cloudinary
    if (category.image && category.image.id) {
      const image_id = category.image.id;
      await cloudinary.uploader.destroy(image_id);
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/category`,
      }
    );

    updatedImage = {
      id: public_id,
      url: secure_url,
    };
  }

  if (updatedImage !== undefined) category.image = updatedImage;

  // Check if name is updated
  // If updated, check if it is unique or not
  if (name) {
    const isMatch = await categoryModel.findOne({ name });
    if (isMatch)
      return next(new Error("Category already exists", { cause: 400 }));
    category.name = name;
    category.slug = slugify(name);
  }

  // Save the updated category in the DB
  await category.save();
  res.status(200).json({
    success: true,
    category,
  });
});
