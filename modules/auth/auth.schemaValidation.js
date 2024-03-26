import Joi from "joi";

const allowedRoles = ["user", "seller", "admin"];

export const signUpSchema = Joi.object({
  username: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\#])[A-Za-z\d@$!%*?&\#]{8,}$/
    )
    .min(8)
    .max(24)
    .required(),
  address: Joi.string(),
  phone: Joi.string().pattern(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/),
  role: Joi.string()
    .valid(...allowedRoles)
    .required(),
}).required();

export const activationSchema = Joi.object({
  ativationToken: Joi.string().required(),
  activationCode: Joi.string().length(4).required(),
}).required();

export const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\#])[A-Za-z\d@$!%*?&\#]{8,}$/
    )
    .min(8)
    .max(24)
    .required(),
}).required();

export const forgetSchema = Joi.object({
  email: Joi.string().email().required(),
}).required();

export const resetPassSchema = Joi.object({
  resetPasswordToken: Joi.string().required(),
  forgetCode: Joi.string().length(4).required(),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\#])[A-Za-z\d@$!%*?&\#]{8,}$/
    )
    .min(8)
    .max(24)
    .required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
});
