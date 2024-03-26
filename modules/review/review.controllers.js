import productModel from "../../DB/models/product.model.js";
import reviewModel from "../../DB/models/review.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const addReview = asyncHandler(async (req, res, next) => {
  const { comment, rating, productId } = req.body;

  //check for productId
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("product is not found", { cause: 404 }));

  const review = await reviewModel.create({
    comment,
    rating,
    productId,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    review,
  });
});

export const updateReview = asyncHandler(async (req, res, next) => {
  const { comment, rating } = req.body;
  const { id } = req.params;

  const review = await reviewModel.findById(id);
  if (!review) return next(new Error("review is not found"), { cause: 404 });

  if (comment) review.comment = comment;
  if (rating) review.rating = rating;

  await review.save();
  res.status(200).json({
    success: true,
    message: "Review is updated successfully",
    review,
  });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const isDeleted = await reviewModel.deleteOne({ _id: id });
  if (!isDeleted) return next(new Error("review is not found", { cause: 404 }));

  //return response
  res.status(200).json({
    success: true,
    message: "Review is deleted successfully",
  });
});

export const getReviewsForProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  //check for productId
  const reviews = await reviewModel.find({ productId });
  if (!reviews)
    return next(new Error("No reviews for this product", { cause: 404 }));

  //return response
  res.status(200).json({
    success: true,
    reviews,
  });
});
