import Joi from "joi";

export const addReviewSchema = Joi.object({
  productId: Joi.string().required(),
  comment: Joi.string(),
  rating: Joi.number().required(),
});

export const updateReviewSchema = Joi.object({
  comment: Joi.string(),
  rating: Joi.number().required(),
});
