const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// saveSchema.virtual("post", {
//   path: "Post",
//   localField: "postId",
//   foreignField: "_id",
//   populate: [
//     { path: "creator", model: "User" },
//     { path: "likes", model: "Like" },
//   ],
// });

const Save = mongoose.models.Save || mongoose.model("Save", saveSchema);

module.exports = Save;
