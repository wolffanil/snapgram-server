const express = require("express");
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  updateCountRepost,
} = require("./post.controller.js");
const protect = require("../middlewares/auth.middleware.js");
const commentRouter = require("../comment/comment.routes.js");

const router = express.Router();

router.use(protect);

router.use("/:postId/comments", commentRouter);

router.route("/").get(getAllPosts).post(createPost);

router.route("/search").get(searchPosts);
router.route("/update-count-repost").patch(updateCountRepost);

router.route("/:postId").get(getPostById).patch(updatePost).delete(deletePost);

module.exports = router;
