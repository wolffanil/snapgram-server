const tokenService = require("../token/token.service.js");
const User = require("../user/user.model.js");
const AppError = require("../utils/AppError");
const Email = require("../utils/email.js");

class AuthService {
  async registration({ user, ip, dataDevice, next }) {
    // const candidate = await User.findOne({ $or: [{ email }, { name }] });

    // if (candidate) {
    //   return next(
    //     new AppError(
    //       `Пользователь с почтовым адресом ${email} или именнем ${name} уже существует `,
    //       404
    //     )
    //   );
    // }

    // const newUser = await User.create({
    //   name,
    //   email,
    //   password,
    // });

    const tokens = await tokenService.generateTokens({
      id: user._id,
      name: user.name,
    });

    const session = await tokenService.saveToken({
      userId: user._id,
      oldRefreshToken: "",
      refreshToken: tokens.refreshToken,
      dataDevice,
      ip,
    });

    const userData = this.returnUserData(user);

    return { ...tokens, userData, session };
  }

  async login({ user, ip, dataDevice, next }) {
    // const user = await User.findOne({ email }).select("+password");

    // if (!user || !(await user.correctPassword(password, user.password))) {
    //   return next(new AppError("Логин или пароль не верны", 404));
    // }

    const tokens = await tokenService.generateTokens({
      id: user._id,
      name: user.name,
    });

    const session = await tokenService.saveToken({
      userId: user._id,
      oldRefreshToken: "",
      refreshToken: tokens.refreshToken,
      dataDevice,
      ip,
    });

    // user.isOnline = true;
    // await user.save();

    const userData = this.returnUserData(user);

    const type = dataDevice?.browser || dataDevice?.model || "не извустно";
    const device = dataDevice?.device || "не извустно";

    new Email(user).sendLogged(ip, type, device);

    return { ...tokens, userData, session };
  }

  async logout(refreshToken, user) {
    await User.findByIdAndUpdate(user.id, { isOnline: false });
    await tokenService.removeToken(refreshToken);
  }

  async refresh({ refreshToken, dataDevice, body, next }) {
    if (!refreshToken) {
      return next(new AppError("ошибка в токене", 404));
    }

    const { ip } = body;

    const userData = await tokenService.validateRefreshToken(refreshToken);

    const tokenFromDb = await tokenService.findToken({
      refreshToken,
      hash: dataDevice.fingerprint,
    });

    if (!userData || !tokenFromDb) {
      return next(
        new AppError("ошибка защиты, пожалуйста авторизируйтесь ещё раз", 404)
      );
    }
    const user = await User.findById(userData.id);

    // if (user.changedPasswordAfter(userData.iat)) {
    //   return next(new AppError("Пользователь недавно сменил пароль!", 401));
    // }

    const tokens = await tokenService.generateTokens({
      id: user._id,
      name: user.name,
    });

    // await tokenService.removeToken(refreshToken);

    const session = await tokenService.saveToken({
      userId: user._id,
      refreshToken: tokens.refreshToken,
      dataDevice,
      oldRefreshToken: refreshToken,
      ip,
    });

    const userClean = this.returnUserData(user);
    return { ...tokens, userData: userClean, session };
  }

  async createVerifyCode({ type, user, next }) {
    const { email, name, password } = user;
    if (type === "register") {
      const candidate = await User.findOne({ $or: [{ email }, { name }] });

      if (candidate) {
        return next(
          new AppError(
            `Пользователь с почтовым адресом ${email} или именнем ${name} уже существует `,
            404
          )
        );
      }

      const user = await User.create({
        name,
        email,
        password,
        isOnline: false,
      });

      await this.sendVerifyCode(user, "Код подтвержде́ние");

      return;
    } else if (type === "login") {
      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Логин или пароль не верны", 404));
      }

      await this.sendVerifyCode(user, "Код подтвержде́ние");

      return;
    }

    return;
  }

  async resetCode({ body, next }) {
    const { email, password } = body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Логин или пароль не верны", 404));
    }

    await this.sendVerifyCode(user, "Код подтвержде́ние");
  }

  async sendCodeResetPassword({ email, next }) {
    if (!email) return next(new AppError("Email должен быть", 404));

    const user = await User.findOne({ email });

    if (!user) return next(new AppError("пользователь не найден", 404));

    await this.sendVerifyCode(user, "Код для сброса пароля", "resetPassword");

    return true;
  }

  async resetPassword({ user, newPassword, next }) {
    const isSamePassword = await user.correctPassword(
      newPassword,
      user.password
    );
    if (isSamePassword)
      return next(new AppError("Вы ввели свой старый пароль", 404));

    user.password = newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await tokenService.removeAllTokensUser({ userId: user._id });

    return true;
  }

  async generateQrToken({ userId }) {
    const token = tokenService.generateTokenQr({ userId });
    return token;
  }

  async scanQr({ token, next }) {
    if (!token) {
      return next(new AppError("Нету токена. ", 404));
    }

    const userData = await tokenService.validateQrToken(token);

    if (!userData) return next(new AppError("Ошибка токена", 404));

    const user = await User.findById(userData.userId);

    if (!user) return next(new AppError("Пользователь не найден", 404));

    return user;
  }

  async sendVerifyCode(user, title, typeCode = "verifyCode") {
    const codeVerify = user.createCode(typeCode);

    if (process.env.NODE_ENV === "development") console.log(codeVerify, "code");

    await user.save({ validateBeforeSave: false });

    new Email(user).sendCode(title, String(codeVerify), typeCode);

    return;
  }

  returnUserData(userData) {
    return {
      _id: userData.id || userData._id,
      name: userData.name,
      email: userData.email,
      imageUrl: userData.imageUrl,
      nick: userData?.nick || "",
      bio: userData?.bio || "",
      isOnline: userData.isOnline,
    };
  }
}

module.exports = new AuthService();
