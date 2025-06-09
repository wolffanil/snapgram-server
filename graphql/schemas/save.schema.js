const { GraphQLObjectType, GraphQLID, GraphQLFloat } = require("graphql");
const Post = require("../../post/post.model");

const SaveType = new GraphQLObjectType({
  name: "Save",
  fields: () => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLID },
    postId: { type: GraphQLID },
    post: {
      type: require("./post.schema.js"),
      async resolve(parent) {
        return await Post.findById(parent.postId).lean();
      },
    },
    createdAt: { type: GraphQLFloat },
    updatedAt: { type: GraphQLFloat },
  }),
});

module.exports = SaveType;
