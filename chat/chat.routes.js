const express = require("express");

const {
  getMyChats,
  accessChat,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  changeDataGroup,
} = require("./chat.controller.js");
const protect = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.use(protect);

router.route("/group").post(createGroupChat);
router.route("/groupremove").patch(removeFromGroup);
router.route("/groupadd").patch(addToGroup);
router.route("/:chatId").patch(changeDataGroup);
router.route("/").get(getMyChats).post(accessChat);

module.exports = router;
