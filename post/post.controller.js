const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const postService = require("./post.service");

class PostContoller {
  getAllPosts = catchAsync(async (req, res, next) => {
    const data = await postService.getAllPosts({ query: req.query });

    res.status(200).json({
      posts: data.posts,
      hasMore: data.hasMore,
      page: data.page,
    });
  });

  getPostById = catchAsync(async (req, res, next) => {
    const postId = req.params.postId;
    if (!postId) return next(new AppError("Id поста должен быть", 404));

    const post = await postService.getPostById({ postId });

    res.status(200).json(post);
  });

  createPost = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const post = await postService.createPost({ body: req.body, userId });

    res.status(201).json(post);
  });

  updatePost = catchAsync(async (req, res, next) => {
    const postId = req.params.postId;
    if (!postId) return next(new AppError("Id поста должен быть", 404));

    const post = await postService.updatePost({ postId, body: req.body });

    res.status(200).json(post);
  });

  deletePost = catchAsync(async (req, res, next) => {
    const postId = req.params.postId;
    if (!postId) return next(new AppError("Id поста должен быть", 404));

    await postService.deletePost({ postId });

    res.status(204).json({
      status: "success",
    });
  });

  searchPosts = catchAsync(async (req, res, next) => {
    const posts = await postService.searchPosts({ query: req.query });

    res.status(200).json(posts);
  });

  updateCountRepost = catchAsync(async (req, res, next) => {
    const postId = req.body.postId;

    const post = await postService.updateCountRepost(postId);

    res.status(200).json(post);
  });
}

module.exports = new PostContoller();
