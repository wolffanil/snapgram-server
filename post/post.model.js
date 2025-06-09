const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    caption: {
      type: String,
      maxlength: [2200, "Your caption is a very long than 2200 char"],
    },
    countRepost: {
      type: Number,
      default: 0,
    },
    tags: [String],
    location: String,
    imageUrl: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.index({ caption: "text", tags: "text" });

postSchema.virtual("likes", {
  ref: "Like",
  foreignField: "postId",
  localField: "_id",
});

postSchema.virtual("commentsCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
  count: true,

  // options: {
  //   match: { parentId: { $in: [null, undefined] } },
  // },
});

postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
});

postSchema.virtual("saves", {
  ref: "Save",
  localField: "_id",
  foreignField: "postId",
  // options: {
  //   select: "-postId",
  // },
});

postSchema.statics.searchPosts = async function (searchTerm) {
  const regex = new RegExp(searchTerm, "i");
  return await this.find({
    $or: [{ caption: { $regex: regex } }, { tags: { $in: [regex] } }],
  })
    .lean()
    .populate({
      path: "likes",
    })
    .populate({
      path: "commentsCount",
    })
    .populate({
      path: "saves",
      select: "userId _id",
    })
    .populate({
      path: "creator",
      select: "-password -bio -email",
    });
};

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

module.exports = Post;
