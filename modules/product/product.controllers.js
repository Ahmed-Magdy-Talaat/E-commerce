import brandModel from "../../DB/models/brand.model.js";
import categoryModel from "../../DB/models/category.model.js";
import productModel from "../../DB/models/product.model.js";
import subCategoryModel from "../../DB/models/subcategory.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.config.js";
import slugify from "slugify";

export const addProduct = asyncHandler(async (req, res, next) => {
  const product = req.body;

  if (!req.files["coverImage"] || req.files["coverImage"].length === 0)
    return next(new Error("Cover image is required", { cause: 400 }));

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.files["coverImage"][0].path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/products/${product.title}/coverImage`,
    }
  );
  const coverImage = {
    id: public_id,
    url: secure_url,
  };

  let images = [];

  if (req.files["images"]) {
    for (const file of req.files["images"]) {
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.CLOUD_FOLDER_NAME}/products/${product.title}/images`,
        }
      );

      images.push({
        id: public_id,
        url: secure_url,
      });
    }
  }

  // Check for categoryId is found in DB
  const { categoryId, subcategoryId, brandId } = product;
  let isFound =
    (await categoryModel.findById(categoryId)) &&
    (await subCategoryModel.findById(subcategoryId)) &&
    (await brandModel.findById(brandId));

  if (!isFound) {
    return next(
      new Error("Category, Brand, and Subcategory should be valid", {
        cause: 400,
      })
    );
  }

  const newProduct = new productModel({
    ...product,
    slug: slugify(product.title),
    coverImage,
    productImages: images,
    addedBy: req.user._id,
  });
  await newProduct.save();

  res.status(200).json({ success: true, product: newProduct });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await productModel.findById(id);
  if (!product) return next(new Error("product is not found", { cause: 404 }));
  if (req.user.role == "seller" && req.user._id !== product.addedBy)
    return next(
      new Error("You are not authorized to delete this product", { cause: 403 })
    );
  const deleted = await productModel.deleteOne({ _id: id });
  if (!deleted) return next(new Error("Somethins went wrong", { cause: 400 }));
  res.status(200).json({
    success: true,
    message: "product is deleted successfully",
  });
});

export const getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await productModel
    .find({})
    .populate("subcategoryId")
    .populate("brandId")
    .populate("categoryId");
  if (!products) return next(new Error("No products is found", { cause: 404 }));
  res.status(200).json({
    success: true,
    products,
  });
});

export const getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await productModel
    .findById(id)
    .populate("subcategoryId")
    .populate("brandId")
    .populate("categoryId");
  if (!product)
    return next(new Error("this product is not found", { cause: 404 }));
  res.status(200).json({
    success: true,
    product,
  });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const { id } = req.params;
  const product = await productModel.findById(id);
  if (!product) return next(new Error("product is not found", { cause: 404 }));

  //check if the user is authorized or not
  if (req.user.role === "seller" && data.addedBy !== req.user._id)
    return next(
      new Error("You are not authorized to access this resource", {
        cause: 400,
      })
    );

  //update the title if found
  if (data.title != undefined) {
    //check if the title is alredy in DB or not
    const isMatch =
      (await productModel.findOne({ title: data.title })) && id != product._id;
    if (isMatch)
      return next(new Error("this title is already found", { cause: 400 }));
    product.title = data.title;
    product.slug = slugify(data.title);
  }

  if (data.description) product.description = data.description;

  if (data.basePrice) product.basePrice = data.basePrice;

  if (data.discount) product.discount = data.discount;

  if (data.rate) product.rate = data.rate;

  if (data.stock) product.stock = data.stock;
  //update the cover image
  if (req.files && req.files["coverImage"]) {
    //remove the previous cover image from the cloud
    await cloudinary.uploader.destroy(product.coverImage.id);

    //upload the new cover Image
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files["coverImage"][0].path,
      {
        folder: `/${process.env.CLOUD_FOLDER_NAME}/products/${product.title}/coverImage`,
      }
    );

    product.coverImage = {
      url: secure_url,
      id: public_id,
    };
  }

  //check to upload the images of the product
  if (req.files && req.files["images"]) {
    const imgs = product.productImages;
    //remove the previous cover image from the cloud
    imgs.forEach(async (img) => {
      await cloudinary.uploader.destroy(img.id);
    });

    const updatedImages = req.files["images"];
    let newImages = [];
    //upload the new  Images

    for (const image of updatedImages) {
      console.log(image);
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image.path,
        {
          folder: `/${process.env.CLOUD_FOLDER_NAME}/products/${product.title}/productImages`,
        }
      );
      newImages.push({
        id: public_id,
        url: secure_url,
      });
    }
    console.log(newImages);
    product.productImages = newImages;
  }
  //check for categoryId
  if (data.categoryId) {
    const found = await categoryModel.findById(data.categoryId);
    if (!found) return next(new Error("category is not found", { cause: 404 }));
    product.categoryId = data.categoryId;
  }

  //check for subcategory
  if (data.subcategoryId) {
    const found = await subCategoryModel.findById(data.subcategoryId);
    if (!found)
      return next(new Error("Subcategory is not found", { cause: 404 }));
    //check if the subcategory is already has the same category as the product category
    if (product.categoryId === found.categoryId)
      product.subcategoryId = data.subcategoryId;
    else
      return next(
        new Error(
          "the subcategory of the product must be related to its category",
          { cause: 404 }
        )
      );
  }

  if (data.brandId) {
    const found = await brandModel.findById(data.brandId);
    if (!found) return next(new Error("Brand is not found", { cause: 404 }));

    if (found.subCategory.some((sub) => sub === product.subcategoryId))
      product.brandId = data.brandId;
  }

  //check for specs
  if (data.specs) {
    product.specs = data.specs;
  }
  await product.save();
  res.status(200).json({
    success: true,
    product,
  });
});

export const getSpecificProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await productModel
    .findById(id)
    .populate("categoryId")
    .populate("subcategoryId")
    .populate("brandId");
  if (!product) return next(new Error("product is not found", { cuse: 404 }));
  res.status(200).json({
    success: true,
    product,
  });
});
