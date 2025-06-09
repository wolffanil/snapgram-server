const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLFloat } = require("graphql");

const LikeType = new GraphQLObjectType({
  name: "Like",
  fields: () => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLID },
    postId: { type: GraphQLID },
    commentId: { type: GraphQLID },
    createdAt: { type: GraphQLFloat },
    updatedAt: { type: GraphQLFloat },
  }),
});

module.exports = LikeType;
