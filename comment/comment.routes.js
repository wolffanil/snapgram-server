const express = require("express");
const {
  createComment,
  getAllComments,
  updateComment,
  deleteComment,
  getCommentById,
} = require("./comment.controller.js");
const protect = require("../middlewares/auth.middleware.js");

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route("/").post(createComment).get(getAllComments);

router
  .route("/:commentId")
  .patch(updateComment)
  .delete(deleteComment)
  .get(getCommentById);

module.exports = router;
