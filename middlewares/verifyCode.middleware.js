const User = require("../user/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");

const verifyCode = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    req._isStartVerify = true;
    return next();
  }

  const hashedCode = crypto
    .createHash("sha256")
    .update(String(code))
    .digest("hex");

  const user = await User.findOne({
    verificationCode: hashedCode,
    codeExpiry: { $gt: Date.now() },
  }).select("+password");

  if (!user) return next(new AppError("неверный код или код просрочен", 404));

  user.verificationCode = undefined;
  user.codeExpiry = undefined;
  user.isOnline = true;
  await user.save();

  req.currentUser = user;
  req._isStartVerify = false;
  next();
});

module.exports = verifyCode;
