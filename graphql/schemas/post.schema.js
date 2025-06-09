const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLFloat,
} = require("graphql");
const UserType = require("./user.schema");
const User = require("../../user/user.model");
const LikeType = require("./like.schema");
const Like = require("../../like/like.model");
const SaveType = require("./save.schema");
const Save = require("../../save/save.model");
const CommentType = require("./comment.schema");
const Comment = require("../../comment/comment.model");

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    _id: { type: GraphQLString },
    creator: {
      type: UserType,
      async resolve(parent) {
        return await User.findById(parent.creator).lean();
      },
    },
    caption: { type: GraphQLString },
    countRepost: { type: GraphQLInt },
    tags: { type: new GraphQLList(GraphQLString) },
    location: { type: GraphQLString },
    imageUrl: { type: GraphQLString },
    createdAt: { type: GraphQLFloat },
    updatedAt: { type: GraphQLFloat },
    likes: {
      type: new GraphQLList(LikeType),
      async resolve(parent) {
        return await Like.find({ postId: parent._id }).lean();
      },
    },
    saves: {
      type: new GraphQLList(SaveType),
      async resolve(parent) {
        return await Save.find({ postId: parent._id }).lean();
      },
    },
    commentsCount: {
      type: GraphQLInt,
      async resolve(parent) {
        return await Comment.find({ postId: parent._id }).countDocuments();
      },
    },
    comments: {
      type: new GraphQLList(CommentType),
      async resolve(parent) {
        return await Comment.find({ postId: parent._id }).lean();
      },
    },
  }),
});

module.exports = PostType;
