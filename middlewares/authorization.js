export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    // <-- Accept req as an argument
    if (!roles.includes(req.user.role)) {
      return next(new Error("You are not authorized to access this resource"), {
        cause: 403,
      });
    }
    next();
  };
};
