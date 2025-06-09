const User = require("../user/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");

const checkResetCode = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  if (!code) return next(new AppError("Код должен быть", 404));

  const hashedCode = crypto
    .createHash("sha256")
    .update(String(code))
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedCode,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) return next(new AppError("неверный код или код просрочен", 404));

  req.currentUser = user;
  next();
});

module.exports = checkResetCode;
