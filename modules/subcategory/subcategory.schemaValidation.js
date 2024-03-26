import Joi from "joi";
export const subcategory = Joi.object({
  name: Joi.string().required().min(3).max(25),
});
