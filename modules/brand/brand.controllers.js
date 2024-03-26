import { asyncHandler } from "../../utils/asyncHandler.js";
import subCategoryModel from "../../DB/models/subcategory.model.js";
import cloudinary from "../../utils/cloud.config.js";
import slugify from "slugify";
import brandModel from "../../DB/models/brand.model.js";
import { subcategory } from "../subcategory/subcategory.schemaValidation.js";

/*  add Brand
destruct name , brandfrom the req.body
destruct the category id from req.params
check if the brand is already in the DB or not
check if image for brand exists 
if true upload it on cloudinary
create a new instance of brand
return a response containing the new category 
*/
export const addBrands = asyncHandler(async (req, res, next) => {
  //   destruct name , slug and image from the req.body
  const { name, subcategory } = req.body;
  const isFound = await brandModel.findOne({ name });
  if (isFound) return next(new Error("Brand is already exist", { cause: 404 }));

  //check if an image is uploaded
  if (!req.file)
    return next(new Error("Image is a required field", { cause: 400 }));

  // upload the brand image  on cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/brands`,
    }
  );

  const brandImage = {
    id: public_id,
    url: secure_url,
  };

  //check if the subcategory is already in the DB
  subcategory.forEach(async (id) => {
    const isFound = await subCategoryModel.findById(id);
    if (!isFound)
      return next(
        new Error("one ofsubcategories is not found ", { cause: 404 })
      );
  });
  //  create the category and save it in the DB
  const brand = await brandModel.create({
    name,
    slug: slugify(name),
    brandImage,
    createdBy: req.user._id,
    subcategory,
  });

  //   return a response containing the new category
  res.status(200).json({
    success: true,
    brand,
  });
});

export const getAllBrands = asyncHandler(async (req, res, next) => {
  // Now `brands` will contain all brands with their subcategories populated

  const brands = await brandModel.find({}).populate({
    path: "subcategory",
  });

  if (!brands)
    return next(
      new Error("No subcategories is found for this category", { cause: 404 })
    );
  res.status(200).json({
    success: true,
    brands,
  });
});

export const deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await brandModel.findById(id);
  if (!brand) return next(new Error("Brand is not found", { cause: 404 }));
  if (brand.brandImage && brand.brandImage.id) {
    const public_id = brand.brandImage.id;
    await cloudinary.uploader.destroy(public_id);
  }
  const deleted = await brandModel.deleteOne({ _id: id });
  if (!deleted) return next(new Error("something went wrong", { cause: 400 }));
  res.status(200).json({
    success: true,
    message: "brand deleted successfully",
  });
});

/****************************updateBrand********************************* */

/*
find the brand using its id
check if the image is updated
if updated delete the previous cover image and upload the current image to cloudinary
check if name is updated
if updated check if it is unique or not
save the updated brand in the DB
return response with the new category
*/
export const updatebrand = asyncHandler(async (req, res, next) => {
  const { name, subcategory } = req.body;
  const { id } = req.params;
  let updatedImage;

  // Find the category using its id
  const brand = await brandModel.findById(id);

  // Chsubeck if the image is updated
  if (req.file) {
    // If updated, delete the previous cover image and upload the current image to Cloudinary
    if (brand.brandImage && brand.brandImage.id) {
      const image_id = brand.brandImage.id;
      await cloudinary.uploader.destroy(image_id);
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/brands`,
      }
    );

    updatedImage = {
      id: public_id,
      url: secure_url,
    };
  }

  if (updatedImage !== undefined) brand.brandImage = updatedImage;

  // Check if name is updated
  // If updated, check if it is unique or not
  if (name) {
    const isMatch = await brandModel.findOne({ name });
    if (isMatch) return next(new Error("Brand already exists", { cause: 400 }));
    brand.name = name;
    brand.slug = slugify(name);
  }
  //check if subcategory is not undefined
  if (subcategory != undefined) {
    subcategory.forEach(async (id) => {
      const isFound = await subCategoryModel.findById(id);
      if (!isFound)
        return next(
          new Error("one of subcategories is not found", { cause: 404 })
        );
    });
    brand.subcategory = subcategory;
  }
  // Save the updated category in the DB
  await brand.save();
  res.status(200).json({
    success: true,
    subcategory,
  });
});
