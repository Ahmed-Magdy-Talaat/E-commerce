import Joi from "joi";

export const addCoupon = Joi.object({
  code: Joi.string().required(),
  discountValue: Joi.number().required(),
  discountType: Joi.string().valid("percentage", "fixed").required(),
  startDate: Joi.date()
    .greater(Date.now() - 24 * 60 * 60 * 1000)
    .required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  usageLimit: Joi.number().min(1),
  couponsNo: Joi.number().min(1),
});

export const updateCoupon = Joi.object({
  code: Joi.string(),
  discountValue: Joi.number(),
  discountType: Joi.string().valid("percentage", "fixed"),
  startDate: Joi.date()
    .greater(Date.now() - 24 * 60 * 60 * 1000)
    .optional(),
  endDate: Joi.date().greater(Joi.ref("startDate")).optional(),
  usageLimit: Joi.number().min(1),
  couponsNo: Joi.number().min(1),
});
