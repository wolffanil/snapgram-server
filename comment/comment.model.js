const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      index: true,
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    parentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Comment",
    },
    text: {
      type: String,
      require: [true, "Text most be"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);

commentSchema.virtual("likes", {
  ref: "Like",
  localField: "_id",
  foreignField: "commentId",
});

commentSchema.virtual("children", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentId",
});

module.exports = Comment;
