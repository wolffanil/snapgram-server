const Like = require("../like/like.model");
const Token = require("../token/token.model");
const tokenService = require("../token/token.service");
const AppError = require("../utils/AppError");
const User = require("./user.model");

class UserService {
  async getUserById({ userId }) {
    const user = await User.findById(userId).lean().populate("posts");

    return user;
  }

  async getUserLikedPosts({ userId }) {
    const likedPosts = await Like.find({
      userId,
      commentId: { $in: [null, undefined] },
    })
      .lean()
      .populate("postId")
      .exec();

    const posts = likedPosts
      ?.map((item) => item.postId)
      .filter((posts) => posts?._id);

    return posts;
  }

  async updateUser({ userId, body, next }) {
    const { imageUrl, bio, name, nick } = body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        imageUrl,
        bio,
        name,
        nick,
      },
      {
        new: true,
      }
    );

    if (!user) return next(new AppError("пользователь не найден", 404));

    return user;
  }

  async getUsers({ query }) {
    const q = query.q;

    let users;

    if (q) {
      users = await User.searchUsers(q);
    } else {
      users = await User.find()
        .limit(10)
        .sort({ createdAt: "desc" })
        .lean()
        .select("-password -bio -email");
    }

    return users;
  }

  async getMyTokens({ userId }) {
    const tokens = await Token.find({ userId })
      .sort({ updatedAt: -1 })
      .select("-refreshToken -fingerprint")
      .lean();

    return tokens;
  }

  async deleteToken({ tokenId, userId, next }) {
    await Token.findOneAndDelete({
      _id: tokenId,
      userId,
    }).lean();

    // if (!token) return next(new AppError("Токен не был найден", 404));

    return;
  }

  async updatePassword({ userId, body, next }) {
    const { passwordCurrent, newPassword, sessionId } = body;

    const user = await User.findById(userId).select("+password");

    if (!user) throw new AppError("пользователь не найден", 404);

    // if (!(await user.currectPassword(passwordCurrent, user.password))) {
    //   return next(new AppError("пароль не верен", 404));
    // }

    if (!(await user.correctPassword(passwordCurrent, user.password))) {
      throw new AppError("пароль не верен", 404);
    }

    user.password = newPassword;
    await user.save();

    await tokenService.removeOthersTokensUser({ userId, sessionId });

    return true;
  }
}

module.exports = new UserService();
