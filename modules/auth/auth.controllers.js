import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import userModel from "../../DB/models/user.model.js";
import tokenModel from "../../DB/models/token.model.js";
import { sendMail } from "../../utils/sendMail.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendToken } from "../../utils/sendToken.js";
import cron from "node-cron";
import dotenv from "dotenv";
dotenv.config();

/********************************signUp******************************/

/*
  1-take the inputs from req.body
  2-check if the email exists or not
  3-create an activation object containing activation token and code
  4-send email to the user with an activation code to activate the user
  5-return the response
 */
export const signUp = asyncHandler(async (req, res, next) => {
  //   1-take the inputs from req.body
  const user = req.body;
  const { email } = user;
  // 2-check if the email exists or not
  const isExist = await userModel.findOne({ email });
  if (isExist) next(new Error("Email is already registered", { cause: 400 }));

  // 4-create an activation object containing activation token and code
  const activation = createActivationToken(user);

  const mailTemplateData = {
    name: user.username,
    code: activation.code,
  };
  const mailOptions = {
    to: user.email,
    subject: "Activate your account",
    data: mailTemplateData,
    template: "activation-mail.ejs",
  };

  //4-send email to the user with an activation code to activate the user
  await sendMail(mailOptions);

  //5-return the response
  res.status(200).json({
    success: true,
    activationToken: activation.token,
    message: `Check your email ${user.email} please , to activate your account`,
  });
});

/*
1-generate the activation code
2-generate the activation token
3-return an object of activation code and token
 */
export const createActivationToken = (user) => {
  // 1-generate the activation code
  const code = Math.floor(1000 + Math.random() * 9000).toString();

  // 2-generate the activation token
  const token = jwt.sign({ user, code }, process.env.ACTIVATION_SECRET_KEY, {
    expiresIn: "10m",
  });

  // 3-return an object of activation code and token
  return {
    code,
    token,
  };
};

/********************************ActivateEmail******************************/

/*Activate Email
1-destruct the req.body
2-get the activation object by verifying the token
3-check if the activationCode is same as that exists in the activation token
4-create a new instance of usermodel 
5.hash the password of user
6.save the user in the DB
*/
export const acivateEmail = asyncHandler(async (req, res, next) => {
  //1-destruct the req.body
  const { activationToken, activationCode } = req.body;

  // 2-get the activation object by verifying the token
  const activation = jwt.verify(
    activationToken,
    process.env.ACTIVATION_SECRET_KEY
  );

  // 3-check if the activationCode is same as that exists in the activation token
  if (activation.code != activationCode)
    return next(new Error("Activation code is not correct", { cause: 400 }));

  // 4-create a new instance of usermodel
  const email = await userModel.findOne({ email: activation.user.email });

  if (!email) return new (next("email is already exist", { cause: 400 }))();

  const user = new userModel(activation.user);

  //5.hash the password of user
  const rounds = +process.env.ROUNDS;
  const hashedPassword = bcryptjs.hashSync(user.password, rounds);
  user.password = hashedPassword;

  // 6.save the user in the DB
  await user.save();
  res.status(200).json({
    success: true,
    message: "user registered successfully",
    user,
  });
});

/********************************sigIn******************************/

/* sign in 
1-destruct the email and password from the body
2-check if the email is exist in the DB
3-check if the password matches the password of the user in the DB
4-function sendToken which generate refresh and acess token and store them in the DB and send them to the cookies
5-return response
 */
export const signIn = asyncHandler(async (req, res, next) => {
  // 1-destruct the email and password from the body
  const { email, password } = req.body;

  //2-check if the email is exist in the DB
  const user = await userModel.findOne({ email });
  if (!user) return next(new Error("Email is not found", { cause: 404 }));

  // 3-check if the password matches the password of the user in the DB
  const isMatched = await bcryptjs.compare(password, user.password);
  if (!isMatched) return next(new Error("Invalid credentials", { cause: 400 }));

  // 4-function sendToken which generate refresh and acess token and store them in the DB and send them to the cookies
  await sendToken(user, req, res);

  // 5-return response
  res.status(200).json({
    success: true,
    message: "user signs in successfully",
  });
});
/* log out
1-check if the user is loged in or not
2-clear the cookies
3-find the tokens and update its validity with false
 */

export const logOut = asyncHandler(async (req, res, next) => {
  // Assuming req.user contains the logged-in user's information
  // Assuming req.sessionID contains the unique session identifier for the browser session
  if (req.user == undefined)
    return next(
      new Error("sorry ,you are not signed in your account", { cause: 400 })
    );
  // Clear cookies
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

  //find the tokens and update its validity with false
  await tokenModel.updateMany(
    {
      user: req.user._id,
      sessionId: req.sessionID,
    },
    { isValid: false }
  );

  // Send success response
  res.status(200).json({
    success: true,
    message: "User logged out successfully from this browser session",
  });
});

/********************************forgetPassword******************************/

/*
  forget password
1-destruct the email from req.body
2-check the email exist in the DB or not
3-generate the forget pass code
4-send email to the user with the code required to reset password
5-return the resetPasswordToken as a response
*/
export const forgetPassword = asyncHandler(async (req, res, next) => {
  // 1-destruct the email from req.body
  const { email } = req.body;
  console.log(email);

  //2-check the email exist in the DB or not
  const user = await userModel.findOne({ email });
  if (!user) return next(new Error("User is not found", { cause: 404 }));

  // 3-generate the forget pass code
  const code = Math.floor(1000 + Math.random() * 9000).toString();

  //4-make a resetPasswordToken
  const resetPasswordToken = jwt.sign(
    { email: email, forgetCode: code },
    process.env.RESET_PASSWORD_KEY
  );
  const data = {
    name: user.username,
    token: code,
  };

  console.log(code, resetPasswordToken);
  //5-send email to the user

  const mailOptions = {
    to: email,
    subject: "Reset your Password",
    data,
    template: "reset-password.ejs",
  };

  //6-send the token as a response
  res.status(200).json({
    success: true,
    token: resetPasswordToken,
  });
});

/********************************resetPassword******************************/

/*
1-destruct resetPasswordToken,email,forgetCode,password,confirmPassword from req.body
2-check if email exists
3-check if the forgetCode is correct
4-check if the password is the same as confirmPassword
5-check for all tokens in the database that attached to this user in the database and make its isValid attribute false
6-hash the new password and update the user password the new password and save it in the db
7-return the response
*/
export const resetPassword = asyncHandler(async (req, res, next) => {
  // 1-destruct resetPasswordToken,email,forgetCode,password,confirmPassword from req.body
  const { resetPasswordToken, forgetCode, password, confirmPassword } =
    req.body;

  const resetObj = jwt.verify(
    resetPasswordToken,
    process.env.RESET_PASSWORD_KEY
  );

  //2-check if the email is already exist
  const { email } = resetObj;
  const user = await userModel.findOne({ email });
  if (!user) return next(new Error("User is not found", { cause: 404 }));

  // 3-check if the forgetCode is correct
  console.log(resetObj);
  if (resetObj.forgetCode !== forgetCode)
    return next(new Error("Reset code is not correct", { cause: 400 }));

  // 4-check if the password is correct
  if (password !== confirmPassword)
    return next(new Error("Confirm password is not matched", { cause: 400 }));

  // 5-check for all tokens in the database that attached to this user in the database and make its isValid attribute false
  const tokens = await tokenModel.find({ user: user._id });
  if (tokens) {
    tokens.forEach(async (token) => {
      token.isValid = false;
      await token.save();
    });
  }

  //6-hash the new password and update the user password the new password and save it in the db
  const rounds = +process.env.ROUNDS;
  user.password = bcryptjs.hashSync(password, rounds);
  await user.save();

  //7-return the response
  res.status(200).json({
    success: true,
    message: "password reset is done successfully ",
  });
});

/******************************update Tokens****************************/
/*

destruct the access token and refresh token from req.cookies
Check if refresh token is valid and not expired
get the user id using the refresh token and check for the existance of the user
make the isValid for refresh Token false
update the refresh and access token and store them in req.cookies
 */

export const updateTokens = asyncHandler(async (req, res, next) => {
  // 1-destruct the refresh token from req.cookies
  const { refresh_token } = req.cookies;

  // Check if refresh token is valid and not expired
  const refreshToken = await tokenModel.findOne({ token: refresh_token });
  console.log(refreshToken);
  if (
    !refreshToken ||
    new Date(refreshToken.expiresAt) < Date.now() ||
    !refreshToken.isValid
  ) {
    return next(new Error("Invalid refresh token", { cause: 400 }));
  }

  // get the user id using the refresh token and check for the existance of the user
  const user = await userModel.findById(refreshToken.user);
  if (!user) return next(new Error("User is not found", { cause: 404 }));

  //make the isValid for refresh Token false
  refreshToken.isValid = false;
  await refreshToken.save();

  // update the refresh and access token and store them in req.cookies
  await sendToken(user, req, res);
  res.status(200).json({
    success: true,
    message: "tokens updated successfully",
  });
});

/***************************cron scheduling the tokens removal****************/

cron.schedule(
  "*/15 * * * *",
  asyncHandler(async () => {
    // Remove tokens that have expired or isValid is false
    await tokenModel.deleteMany({
      $or: [{ expiresAt: { $lte: new Date() } }, { isValid: false }],
    });
    console.log("Expired or invalid tokens removed successfully");
  })
);
