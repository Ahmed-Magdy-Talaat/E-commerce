import Joi from "joi";

export const brandSchema = Joi.object({
  subcategory: Joi.array()
    .items(Joi.string())
    .max(5) // Change the number to the desired maximum length
    .required(),
  name: Joi.string().min(2).max(15),
});
