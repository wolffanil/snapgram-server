const catchAsync = require("../utils/catchAsync");
const likeService = require("./like.service");

class LikeContoller {
  createLike = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const like = await likeService.createLike({ body: req.body, next, userId });

    res.status(201).json(like);
  });

  deleteLike = catchAsync(async (req, res, next) => {
    const likeId = req.params.likeId;

    await likeService.deleteLike({ likeId });

    res.status(204).json({
      status: "success",
    });
  });
}

module.exports = new LikeContoller();
