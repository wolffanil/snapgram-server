const Comment = require("../comment/comment.model");
const Like = require("../like/like.model");
const Notification = require("../notification/notification.model");
const Save = require("../save/save.model");
const Post = require("./post.model");
const Message = require("../message/message.model");

class PostService {
  async getAllPosts({ query }) {
    const { page, limit } = query;

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 2;

    const skip = (pageNumber - 1) * pageSize;

    const posts = await Post.find()
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
      })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: "desc" });
    const totalPosts = await Post.countDocuments();
    const hasMore = skip + pageSize < totalPosts;

    return { posts, hasMore, page: pageNumber };
  }

  async getPostById({ postId }) {
    const post = await Post.findById(postId)
      .lean()
      .populate({
        path: "likes",
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "_id name imageUrl",
        },
      })
      .populate({
        path: "comments",
        populate: {
          path: "likes",
          select: "userId",
        },
      })
      .populate({
        path: "saves",
        select: "userId _id",
      })
      .populate({
        path: "creator",
        select: "-password -bio -email",
      });

    return post;
  }

  async createPost({ body, userId }) {
    const { caption, tags, location, imageUrl } = body;

    const newPost = await Post.create({
      creator: userId,
      caption,
      tags,
      location,
      imageUrl,
    });

    return newPost;
  }

  async updatePost({ postId, body }) {
    const { caption, tags, location, imageUrl } = body;

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        caption,
        tags,
        location,
        imageUrl,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return updatedPost;
  }

  async deletePost({ postId }) {
    await Promise.all([
      Post.findByIdAndDelete(postId),
      Like.deleteMany({ postId }),
      Save.deleteMany({ postId }),
      Comment.deleteMany({ postId }),
      Message.deleteMany({ post: postId }),
      Notification.deleteMany({ post: postId }),
    ]);

    return;
  }

  async searchPosts({ query }) {
    const searchTerm = query.q;

    const posts = await Post.searchPosts(searchTerm);

    return posts;
  }

  async updateCountRepost(postId) {
    return await Post.findByIdAndUpdate(
      postId,
      {
        $inc: { countRepost: 1 },
      },
      {
        new: true,
      }
    );
  }
}

module.exports = new PostService();
