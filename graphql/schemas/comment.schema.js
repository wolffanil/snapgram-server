const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
} = require("graphql");
const User = require("../../user/user.model");
const UserType = require("./user.schema");
const Comment = require("../../comment/comment.model");
const LikeType = require("./like.schema");
const Like = require("../../like/like.model");

const CommentType = new GraphQLObjectType({
  name: "Comment",
  fields: () => ({
    _id: { type: GraphQLID },
    text: { type: GraphQLString },
    author: {
      type: UserType,
      async resolve(parent) {
        return await User.findById(parent.author).lean();
      },
    },
    postId: { type: GraphQLString },
    parentId: {
      type: CommentType,
      async resolve(parent) {
        return await Comment.findOne(parent.parentId).lean();
      },
    },
    likes: {
      type: new GraphQLList(LikeType),
      async resolve(parent) {
        return await Like.find({ commentId: parent._id }).lean();
      },
    },
    createdAt: { type: GraphQLFloat },
    updatedAt: { type: GraphQLFloat },
  }),
});

module.exports = CommentType;
