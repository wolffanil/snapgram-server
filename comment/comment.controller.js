const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const commentService = require("./comment.service");

class CommentController {
  createComment = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const comment = await commentService.createComment({
      userId,
      body: req.body,
      next,
    });

    res.status(201).json(comment);
  });

  getAllComments = catchAsync(async (req, res, next) => {
    const postId = req.params.postId;

    const comments = await commentService.getAllComments({ postId });

    res.status(200).json(comments);
  });

  getCommentById = catchAsync(async (req, res, next) => {
    const commentId = req.params.commentId;
    if (!commentId)
      return next(new AppError("Id комментарий должен быть", 404));

    const comment = await commentService.getCommentById({ commentId });

    res.status(200).json(comment);
  });

  deleteComment = catchAsync(async (req, res, next) => {
    const commentId = req.params.commentId;
    if (!commentId)
      return next(new AppError("Id комментарий должен быть", 404));

    await commentService.deleteComment({ commentId });

    res.status(204).json({
      status: "success",
    });
  });

  updateComment = catchAsync(async (req, res, next) => {
    const commentId = req.params.commentId;
    if (!commentId)
      return next(new AppError("Id комментарий должен быть", 404));

    const comment = await commentService.updateComment({
      body: req.body,
      commentId,
      next,
    });

    res.status(200).json(comment);
  });
}

module.exports = new CommentController();
