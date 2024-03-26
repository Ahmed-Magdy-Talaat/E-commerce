import Joi from "joi";

export const addProductToCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1),
});

export const deleteProductFromCartSchema = Joi.object({
  productId: Joi.string().required(),
});

export const updateCartSchema = Joi.object({
  products: Joi.array().items({
    productId: Joi.string().required(),
    quantity: Joi.number().min(1),
  }),
});
