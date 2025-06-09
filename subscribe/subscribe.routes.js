const express = require("express");

const {
  getSubscribers,
  getSubscriptions,
  deleteSubscribe,
  createSubscribe,
} = require("./subscribe.controller");
const protect = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.route("/get-subscriptions").get(getSubscriptions);

router.route("/get-subscribers").get(getSubscribers);

router.route("/").post(createSubscribe);

router.route("/").delete(deleteSubscribe);

module.exports = router;
