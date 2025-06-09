const AppError = require("../utils/AppError.js");
const catchAsync = require("../utils/catchAsync");
const authService = require("./auth.service.js");

class AuthController {
  register = catchAsync(async (req, res, next) => {
    const dataDevice = req._dataDevice;
    const user = req.currentUser;
    const { ip } = req.body;
    const isStartVerify = req?._isStartVerify;

    if (isStartVerify) {
      const type = "register";
      const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      };
      await authService.createVerifyCode({ type, user: userData, next });

      return res.status(201).json({ message: "send verify code by email" });
    }
    const userData = await authService.registration({
      user,
      ip,
      next,
      dataDevice,
    });

    if (!userData) return next(new AppError("something went wrong", 400));

    return this.createSendToken(userData, 201, res, req);
  });

  login = catchAsync(async (req, res, next) => {
    const dataDevice = req._dataDevice;
    const user = req.currentUser;
    const { ip } = req.body;
    const isStartVerify = req?._isStartVerify;

    if (isStartVerify) {
      const type = "login";
      const userData = {
        email: req.body.email,
        password: req.body.password,
      };
      await authService.createVerifyCode({ type, user: userData, next });

      return res.status(201).json({ message: "send verify code by email" });
    }

    const userData = await authService.login({
      user,
      ip,
      next,
      dataDevice,
    });

    if (!userData) return next(new AppError("something went wrong", 400));

    return this.createSendToken({ ...userData }, 200, res, req);
  });

  logout = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    const user = req.user;

    await authService.logout(refreshToken, user);

    res.clearCookie("refreshToken");

    return res.status(200).json({
      status: "success",
    });
  });

  resetCode = catchAsync(async (req, res, next) => {
    const body = req.body;

    await authService.resetCode({ body, next });

    res.status(201).json({ message: "verify code send by email" });
  });

  forgotPassoword = catchAsync(async (req, res, next) => {
    const email = req.body?.email;

    await authService.sendCodeResetPassword({ email, next });

    res
      .status(201)
      .json({ message: "verify code for reset password send by email" });
  });

  resetPassoword = catchAsync(async (req, res, next) => {
    const newPassword = req.body?.newPassword;
    const user = req.currentUser;
    await authService.resetPassword({ user, newPassword, next });

    res
      .status(200)
      .json({ message: "password succefull updated", userId: user.id });
  });

  generateQrToken = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const token = await authService.generateQrToken({ userId });

    res.status(201).json({
      token,
    });
  });

  scanQr = catchAsync(async (req, res, next) => {
    const dataDevice = req._dataDevice;
    const token = req.body.token;
    const { ip } = req.body;

    const user = await authService.scanQr({ token, next });

    const userData = await authService.login({
      user,
      ip,
      next,
      dataDevice,
    });

    return this.createSendToken({ ...userData }, 200, res, req);
  });

  refresh = catchAsync(async (req, res, next) => {
    const dataDevice = req._dataDevice;

    const body = req.body;

    const { refreshToken } =
      req.headers.type === "mobile" ? req?.body : req.cookies;

    const userData = await authService.refresh({
      refreshToken,
      dataDevice,
      body,
      next,
    });

    this.createSendToken(userData, 200, res, req);
  });

  createSendToken = (userData, statusCode, res, req) => {
    if (req.headers.type !== "mobile") {
      res.cookie("refreshToken", userData.refreshToken, {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIERS_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        sameSite: process.env.NODE_ENV === "production" ? "none" : null,
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.SERVER_DOMAIN
            : null,
      });
      userData.refreshToken = undefined;
      return res.status(statusCode).json(userData);
    }
    res.status(statusCode).json(userData);
  };
}

module.exports = new AuthController();
