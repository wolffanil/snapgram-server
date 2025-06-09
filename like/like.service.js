const AppError = require("../utils/AppError");
const Like = require("./like.model");

class LikeService {
  async createLike({ body, next, userId }) {
    const { postId, commentId } = body;

    const newLike = await Like.findOneAndUpdate(
      { userId, postId, commentId },
      {
        userId,
        postId: postId || undefined,
        commentId: commentId || undefined,
      },
      {
        new: true,
        upsert: true,
      }
    );

    if (!newLike) return next(new AppError("лайк не был создан", 404));

    return newLike;
  }

  async deleteLike({ likeId }) {
    await Like.findByIdAndDelete(likeId);

    return;
  }
}

module.exports = new LikeService();
