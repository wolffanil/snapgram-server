const express = require("express");
const {
  register,
  refresh,
  login,
  logout,
  resetCode,
  forgotPassoword,
  resetPassoword,
  generateQrToken,
  scanQr,
} = require("./auth.controller.js");
const protect = require("../middlewares/auth.middleware.js");
const session = require("../middlewares/session.middleware.js");
const verifyCode = require("../middlewares/verifyCode.middleware.js");
const checkResetCode = require("../middlewares/checkResetCode.middleware.js");
const recaptchaCkeck = require("../middlewares/recaptchaCheck.middleware.js");

const router = express.Router();

router.use(session);

router.route("/register").post(verifyCode, register);

router.route("/login").post(recaptchaCkeck, verifyCode, login);

router.route("/logout").post(protect, logout);

router.route("/reset-code").post(resetCode);

router.route("/forgot-password").post(forgotPassoword);

router.route("/reset-password").post(checkResetCode, resetPassoword);

router.route("/generate-token").post(protect, generateQrToken);

router.route("/scan-token").post(scanQr);

router.route("/refresh").post(refresh);

module.exports = router;
