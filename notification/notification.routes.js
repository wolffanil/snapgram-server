const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  getMy,
  createNotification,
  deleteNotifications,
  setIsView,
} = require("./notification.controller.js");

const router = express.Router();

router.use(protect);

router.route("/get-my").get(getMy);

router.route("/").post(createNotification).delete(deleteNotifications);

router.route("/set-is-view").patch(setIsView);

module.exports = router;
