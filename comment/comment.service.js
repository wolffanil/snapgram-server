const Like = require("../like/like.model");
const AppError = require("../utils/AppError");
const Comment = require("./comment.model");

class CommentService {
  async createComment({ body, userId, next }) {
    const { postId, text, parentId } = body;

    const newComment = await Comment.create({
      postId: postId || undefined,
      author: userId,
      text,
      parentId: parentId || undefined,
    });

    if (!newComment) return next(new AppError("Comment not created", 404));

    return newComment;
  }

  async getAllComments({ postId }) {
    let comments;

    if (!req.params.postId) {
      comments = await Comment.find();
    } else {
      comments = await Comment.find({ postId })
        .populate({
          path: "author",
        })
        .populate({
          path: "likes",
          // populate: {
          //   path: "userId",
          //   select: "_id",
          // },
        });
    }

    return comments;
  }

  async getCommentById({ commentId }) {
    const comment = await Comment.findById(commentId)
      .lean()
      .populate({
        path: "children",
        populate: {
          path: "likes",
        },
      })
      .populate({
        path: "children",
        populate: {
          path: "author",
          select: "_id name imageUrl",
        },
      })
      .populate("likes")
      .populate("author", "_id name imageUrl");

    return comment;
  }

  async deleteComment({ commentId }) {
    await Comment.findByIdAndDelete(commentId);

    await Like.deleteMany({ commentId });

    await Comment.deleteMany({ parentId: commentId });
  }

  async updateComment({ commentId, body, next }) {
    const { text } = body;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { text },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!comment)
      return next(
        new AppError("comment not updated, please try again late", 404)
      );

    return comment;
  }
}

module.exports = new CommentService();
