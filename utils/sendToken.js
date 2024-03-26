import tokenModel from "../DB/models/token.model.js";

const accessTokenExpires = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);

const refreshTokenExpires = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "1200",
  10
);

export const accessTokenOptions = {
  expires: new Date(Date.now() + accessTokenExpires * 60 * 1000),
  maxAge: accessTokenExpires * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpires * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpires * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const sendToken = async (user, req, res) => {
  const accessToken = user.signAccessToken();
  const refreshToken = user.signRefreshToken();

  await tokenModel.insertMany([
    {
      user: user._id,
      token: accessToken,
      type: "access",
      expiresAt: accessTokenOptions.expires,
      isValid: true,
    },
    {
      user: user._id,
      token: refreshToken,
      type: "refresh",
      expiresAt: refreshTokenOptions.expires,
      isValid: true,
    },
  ]);

  if (process.env.NODE_DEV == "production") accessTokenOptions.secure = true;

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  return accessToken;
};
