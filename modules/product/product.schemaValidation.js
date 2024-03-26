import Joi from "joi";

// Define Joi schema for the product
export const productValidationSchema = Joi.object({
  title: Joi.string().min(2).max(25).required(),
  slug: Joi.string().required(),
  description: Joi.string(),
  categoryId: Joi.string().required(),
  subcategoryId: Joi.string().required(),
  brandId: Joi.string().required(),
  coverImage: Joi.object({
    id: Joi.string().required(),
    url: Joi.string().required(),
  }).required(),
  productImages: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        url: Joi.string().required(),
      })
    )
    .max(5),
  specs: Joi.array().items(
    Joi.object({
      key: Joi.string(),
      value: Joi.string().required(),
    })
  ),
  addedBy: Joi.string().required(),
  basePrice: Joi.number().required(),
  discount: Joi.number(),
  stock: Joi.number().min(1).required(),
  rate: Joi.number().min(0).max(5),
});

export const updateProductSchema = Joi.object({
  title: Joi.string().min(2).max(25),
  slug: Joi.string(),
  description: Joi.string(),
  categoryId: Joi.string(),
  subcategoryId: Joi.string(),
  brandId: Joi.string(),
  coverImage: Joi.object({
    id: Joi.string(),
    url: Joi.string(),
  }),
  productImages: Joi.array()
    .items(
      Joi.object({
        id: Joi.string(),
        url: Joi.string(),
      })
    )
    .max(5),
  specs: Joi.array().items(
    Joi.object({
      key: Joi.string(),
      value: Joi.string(),
    })
  ),
  addedBy: Joi.string(),
  basePrice: Joi.number(),
  discount: Joi.number(),
  stock: Joi.number().min(1),
  rate: Joi.number().min(0).max(5),
});
