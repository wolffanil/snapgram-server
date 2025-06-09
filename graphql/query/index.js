const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema,
} = require("graphql");
const PostType = require("../schemas/post.schema");
const Post = require("../../post/post.model");
const SaveType = require("../schemas/save.schema");
const Save = require("../../save/save.model");
const Subscribe = require("../../subscribe/subscribe.model");

// const PostsResultType = new GraphQLObjectType({
//   name: "PostsResult",
//   fields: () => ({
//     posts: { type: new GraphQLList(PostType) },
//     page: { type: GraphQLInt },
//   }),
// });

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    posts: {
      type: new GraphQLList(PostType),
      args: {
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        q: { type: GraphQLString },
      },

      async resolve(parent, args, context) {
        if (args.q) {
          const regex = new RegExp(args.q, "i");
          const queryPosts = await Post.find({
            $or: [{ caption: { $regex: regex } }, { tags: { $in: [regex] } }],
          })
            .sort({ createdAt: -1 })
            .lean();

          return queryPosts;
        }

        const { page, limit } = args;
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 2;

        const skip = (pageNumber - 1) * pageSize;

        const subscriptions = await Subscribe.find({
          subscriberId: context.user.id,
        })
          .select("userId")
          .lean();

        const subscribedUserIds = subscriptions.map((sub) => sub.userId);

        const [subscriberPosts, regularPosts] = await Promise.all([
          Post.find({ creator: { $in: subscribedUserIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean(),

          Post.find({ creator: { $nin: subscribedUserIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean(),
        ]);

        if (subscriberPosts.length === 0) {
          const filterUserIds = new Set(subscribedUserIds);

          const posts = regularPosts.filter(
            (post) => !filterUserIds.has(post.creator)
          );

          return posts;
        }

        const combinedPosts = [...subscriberPosts, ...regularPosts];

        const uniquePosts = Array.from(
          new Map(combinedPosts.map((post) => [post._id, post])).values()
        );

        const posts = combinedPosts;

        // Применяем пагинацию

        // const posts = await Post.find()
        //   .sort({ createdAt: -1 })
        //   .skip(skip)
        //   .limit(pageSize)
        //   .lean();

        // const totalPosts = await Post.countDocuments();
        // const hasMore = skip + pageSize < totalPosts;

        // return { posts, hasMore };
        return posts;
      },
    },

    post: {
      type: PostType,
      args: { postId: { type: GraphQLString } },
      async resolve(parent, args) {
        return await Post.findById(args.postId).lean();
      },
    },
    getMySaves: {
      type: new GraphQLList(SaveType),
      async resolve(parent, args, context) {
        const saves = await Save.find({ userId: context.user.id });

        return saves;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
