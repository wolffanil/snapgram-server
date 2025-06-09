const express = require("express");
const {
  getAllMessages,
  createNewMessage,
  editMessage,
  deleteMessage,
  readyMessages,
} = require("./message.contoller.js");
const protect = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.use(protect);

router.route("/:chatId").get(getAllMessages);

router.route("/").post(createNewMessage);

router.route("/:messageId").patch(editMessage);

router.route("/:messageId").delete(deleteMessage);

router.route("/read-messages").patch(readyMessages);

module.exports = router;
