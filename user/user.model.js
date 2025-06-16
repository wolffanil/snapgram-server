const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { generateCode } = require("../utils/generateCode");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please tell us your name!"],
    },
    nick: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "Plaase provide your email"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    imageUrl: {
      type: String,
      default: "upload/profile/default.png",
    },
    password: {
      type: String,
      require: [true, "Please provide a password"],
      select: false,
    },
    bio: {
      type: String,
      maxLength: 1024,
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    isBan: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    codeExpiry: Date,
    passwordResetExpires: Date,
    passwordResetCode: String,
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "creator",
});

// userSchema.virtual("subscribers", {
//   ref: "Subscribe",
//   localField: "_id",
//   foreignField: "userId",
// });

// userSchema.virtual("subscriptions", {
//   ref: "Subscribe",
//   localField: "_id",
//   foreignField: "subscriberId",
// });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createCode = function (type) {
  const code = generateCode();

  const secretCode = crypto
    .createHash("sha256")
    .update(String(code))
    .digest("hex");

  if (type === "verifyCode") {
    this.verificationCode = secretCode;

    this.codeExpiry = Date.now() + 10 * 60 * 1000;
  } else if (type === "resetPassword") {
    this.passwordResetCode = secretCode;
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  }

  return code;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.statics.searchUsers = async function (searchTerm) {
  const reg = new RegExp(searchTerm, "i");

  return await this.find({
    $or: [
      { name: { $regex: reg } },
      { nick: { $regex: reg } },
      { email: { $regex: reg } },
    ],
  })
    .lean()
    .select("-password -bio -email");
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
