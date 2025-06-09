const axios = require("axios");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const recaptchaCkeck = catchAsync(async (req, res, next) => {
  const typeDevice = req.headers?.type;
  if (typeDevice === "mobile") return next();

  const token = req.body.token;

  if (!token) return next(new AppError("error recapthca", 404));

  const SECRET_KEY_v3 = process.env.RECAPTCHA_SECRET_KEY;

  const recaptchaResponse = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY_v3}&response=${token}`
  );

  if (
    !recaptchaResponse.data.success ||
    recaptchaResponse.data.score < 0.5 ||
    recaptchaResponse.data.action !== "auth"
  ) {
    return next(new AppError("error recaptcha action", 404));
  }

  next();
});

module.exports = recaptchaCkeck;
