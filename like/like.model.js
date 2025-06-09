const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    postId: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
    commentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Comment",
    },
  },
  {
    timestamps: true,
  }
);

// likeSchema.virtual("likedPosts", {
//   ref: "Post",
//   localField: "postId",
//   foreignField: "_id",
//   // options: {
//   //   match: { commentId: { $in: [null, undefined] } },
//   // },
// });

const Like = mongoose.models.Like || mongoose.model("Like", likeSchema);

module.exports = Like;
