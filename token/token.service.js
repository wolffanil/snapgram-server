const jwt = require("jsonwebtoken");
const Token = require("./token.model.js");
const { promisify } = require("util");

class TokenService {
  async generateTokens(payload) {
    const accessToken = await jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });
    const refreshToken = await jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async validateAccessToken(token) {
    const userData = await promisify(jwt.verify)(
      token,
      process.env.JWT_ACCESS_SECRET
    );
    return userData;
  }

  async validateRefreshToken(token) {
    const userData = await promisify(jwt.verify)(
      token,
      process.env.JWT_REFRESH_SECRET
    );
    return userData;
  }

  async saveToken({ userId, refreshToken, dataDevice, oldRefreshToken, ip }) {
    const { fingerprint, browser, device, type, brand, model } = dataDevice;

    // const token = await Token.create({
    //   userId,
    //   refreshToken,
    //   fingerprint,
    //   browser,
    //   model,
    //   type,
    //   brand,

    //   device,
    //   ip,
    // });

    const token = await Token.findOneAndUpdate(
      { refreshToken: oldRefreshToken, userId },
      {
        userId,
        refreshToken,
        fingerprint,
        browser,
        model,
        type,
        brand,
        device,
        ip,
      },
      {
        new: true,
        upsert: true,
      }
    );

    const sessionData = this.returnSessionData(token);

    return sessionData;
  }

  async removeToken(refreshToken) {
    await Token.deleteOne({ refreshToken });
  }

  async findToken({ refreshToken, hash }) {
    const tokenData = await Token.findOne({ refreshToken, fingerprint: hash });
    return tokenData;
  }

  async removeAllTokensUser({ userId }) {
    await Token.deleteMany({ userId });
    return true;
  }

  async removeOthersTokensUser({ userId, sessionId }) {
    await Token.deleteMany({ userId, _id: { $ne: sessionId } });
    return true;
  }

  generateTokenQr({ userId }) {
    const qrToken = jwt.sign({ userId }, process.env.JWT_QRACCESS_SECRET, {
      expiresIn: process.env.JWT_QRACCESS_EXPIRS_IN,
    });

    return qrToken;
  }

  async validateQrToken(token) {
    const userData = await promisify(jwt.verify)(
      token,
      process.env.JWT_QRACCESS_SECRET
    );
    return userData;
  }

  returnSessionData(session) {
    return {
      id: session._id,
    };
  }
}

module.exports = new TokenService();
