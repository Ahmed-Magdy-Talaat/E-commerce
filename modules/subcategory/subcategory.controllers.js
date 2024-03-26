import { asyncHandler } from "../../utils/asyncHandler.js";
import subCategoryModel from "../../DB/models/subcategory.model.js";
import cloudinary from "../../utils/cloud.config.js";
import slugify from "slugify";
import categoryModel from "../../DB/models/category.model.js";

/*  add category
destruct name , slug and image from the req.body
destruct the category id from req.params
check if the category is already in the DB or not
check if image for subcategory exists 
if true upload it on cloudinary
else give it a default value
create a new instance of subcategory
return a response containing the new category 
*/
export const addSubcategory = asyncHandler(async (req, res, next) => {
  //   destruct name , slug and image from the req.body
  const { name } = req.body;
  const { categoryId } = req.params;
  const category = await categoryModel.findById(categoryId);
  if (!category)
    return next(new Error("category is not found", { cause: 404 }));
  let image;
  const slug = name;
  //check if the category is already in the DB or not
  const isMatched = await subCategoryModel.findOne({
    $or: [{ name }, { slug }],
  });
  if (isMatched)
    return next(new Error("subcategory already exists", { cause: 404 }));

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
  const subcategory = await subCategoryModel.create({
    name,
    slug,
    image,
    createdBy: req.user._id,
    category: categoryId,
  });
  console.log(subcategory);

  //   return a response containing the new category
  res.status(200).json({
    success: true,
    subcategory,
  });
});

export const getAllSubforCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const subCategories = await subCategoryModel.find({ category: categoryId });
  if (!subCategories)
    return next(
      new Error("No subcategories is found for this category", { cause: 404 })
    );
  res.status(200).json({
    success: true,
    subCategories,
  });
});

export const deleteSubcategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subcategory = await subCategoryModel.findById(id);
  if (!subcategory)
    return next(new Error("subcategory is not found", { cause: 404 }));
  if (subcategory.image && subcategory.image.id) {
    const public_id = subcategory.image.id;
    await cloudinary.uploader.destroy(public_id);
  }
  const deleted = await subCategoryModel.deleteOne({ _id: id });
  if (!deleted) return next(new Error("something went wrong", { cause: 400 }));
  res.status(200).json({
    success: true,
    message: "subcategory deleted successfully",
  });
});

/****************************updateCategory********************************* */

/*
find the subcategory using its id
check if the image is updated
if updated delete the previous cover image and upload the current image to cloudinary
check if name is updated
if updated check if it is unique or not
save the updated category in the DB
return response with the new category
*/
export const updateSubcategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;
  let updatedImage;

  // Find the category using its id
  const subcategory = await subCategoryModel.findById(id);

  // Chsubeck if the image is updated
  if (req.file) {
    // If updated, delete the previous cover image and upload the current image to Cloudinary
    if (subcategory.image && subcategory.image.id) {
      const image_id = subcategory.image.id;
      await cloudinary.uploader.destroy(image_id);
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/subcategory`,
      }
    );

    updatedImage = {
      id: public_id,
      url: secure_url,
    };
  }

  if (updatedImage !== undefined) subcategory.image = updatedImage;

  // Check if name is updated
  // If updated, check if it is unique or not
  if (name) {
    const isMatch = await subCategoryModel.findOne({ name });
    if (isMatch)
      return next(new Error("Category already exists", { cause: 400 }));
    subcategory.name = name;
    subcategory.slug = slugify(name);
  }

  // Save the updated category in the DB
  await subcategory.save();
  res.status(200).json({
    success: true,
    subcategory,
  });
});
