const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      index: true,
    },
    imageUrl: String,
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    repostText: String,
    type: {
      type: String,
      default: "text",
      enum: ["text", "image", "repost", "answer"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// messageSchema.pre(/^find/, function (next) {
//   this.where({ post: { $exists: true, $ne: null } }).populate("post");
//   next();
// });

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

module.exports = Message;
