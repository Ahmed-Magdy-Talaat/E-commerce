export const validate = (schema) => {
  return async (req, res, next) => {
    //validate
    const validationResult = schema.validate(req.body, {
      abortEarly: false,
    });
    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map(
        (obj) => obj.message
      );
      return next(new Error(errorMessages));
    }
    next();
  };
};
