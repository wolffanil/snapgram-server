const Subscribe = require("./subscribe.model");

class SubscribeService {
  async getSubscriptions(userId) {
    return await Subscribe.find({ subscriberId: userId })
      .populate("userId", "imageUrl _id name")
      .lean();
  }

  async getSubscribers(userId) {
    return await Subscribe.find({ userId })
      .populate("subscriberId", "imageUrl _id name")
      .lean();
  }

  async create(subscriberId, userId) {
    return await Subscribe.findOneAndUpdate(
      { userId, subscriberId },
      {
        userId,
        subscriberId,
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  async delete(subscriberId, userId) {
    return await Subscribe.findOneAndDelete({
      subscriberId,
      userId,
    });
  }
}

module.exports = new SubscribeService();
