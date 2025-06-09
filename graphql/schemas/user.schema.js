const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
} = require("graphql");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    nick: { type: GraphQLString },
    email: { type: GraphQLString },
    imageUrl: { type: GraphQLString },
    bio: { type: GraphQLString },
    isOnline: { type: GraphQLBoolean },
    createdAt: { type: GraphQLFloat },
    updatedAt: { type: GraphQLFloat },
  }),
});

module.exports = UserType;
