const mongoose = require("mongoose");

const subscribeSchema = new mongoose.Schema(
  {
    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      requried: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subscribe =
  mongoose.models.Subscribe || mongoose.model("Subscribe", subscribeSchema);

module.exports = Subscribe;
