const catchAsync = require("../utils/catchAsync");
const userService = require("./user.service");

class UserController {
  getUserById = catchAsync(async (req, res, next) => {
    const userId = req.params.userId;

    if (!userId) return next(new AppError("Id пользователя должен быть", 404));

    const user = await userService.getUserById({ userId });

    res.status(200).json(user);
  });

  getUserLikedPosts = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    if (!userId) return next(new AppError("Id пользователя должен быть", 404));

    const posts = await userService.getUserLikedPosts({ userId });

    res.status(200).json(posts);
  });

  updateUser = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const user = await userService.updateUser({ userId, body: req.body, next });

    res.status(200).json(user);
  });

  getUsers = catchAsync(async (req, res, next) => {
    const users = await userService.getUsers({ query: req.query });

    res.status(200).json(users);
  });

  getMyTokens = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const tokens = await userService.getMyTokens({ userId });

    res.status(200).json(tokens);
  });

  deleteToken = catchAsync(async (req, res, next) => {
    const tokenId = req.params.tokenId;
    const userId = req.user.id;

    if (!tokenId) return next(new AppError("Id токена должен быть", 400));

    const status = await userService.deleteToken({ tokenId, userId, next });

    res.status(204).json({
      status: "success",
    });
  });
  updatePassword = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const body = req.body;

    const response = await userService.updatePassword({ userId, body, next });

    if (!response) {
      return next(new AppError("Ошибка обновления пароля", 500));
    }

    res.status(200).json({ message: "password was updated" });
  });

  getAll = catchAsync(async (req, res, next) => {
    const users = await userService.getAll();

    res.status(200).json({ users });
  });

  setBan = catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    const user = await userService.setBan(userId);

    res.status(200).json({ user });
  });

  setUnBan = catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    const user = await userService.setUnBan(userId);

    res.status(200).json({ user });
  });
}

module.exports = new UserController();
