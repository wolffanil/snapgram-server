const express = require("express");

const {
  uploadPhoto,
  resizePhoto,
  deletePhoto,
} = require("./file.controller.js");
const protect = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.use(protect);

router.route("/uploadPhoto").post(uploadPhoto, resizePhoto);

router.route("/deletePhoto/:photoId").delete(deletePhoto);

module.exports = router;
