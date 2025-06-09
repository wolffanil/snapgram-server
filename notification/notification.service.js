const AppError = require("../utils/AppError");
const Notification = require("./notification.model");

class NotificationService {
  async getMy({ userId }) {
    const notifications = await Notification.find({ to: userId })
      .populate("user", "_id name imageUrl")
      .populate("postId", "_id caption")
      .sort({ createdAt: "desc" })
      .lean();

    return notifications;
  }

  async createNotification({ userId, body, next }) {
    const { to, type, postId } = body;

    if(type !== 'comment')  {
      const existNotification = await Notification.findOne({
        type,
        postId: postId._id,
        to,
        user: userId,
      });
  
      if (existNotification) {
        return next(new AppError("уведомленние существует", 404));
      }

    }


    const notification = await Notification.create({
      user: userId,
      to,
      type,
      postId: postId._id,
    });

    return notification;
  }

  async deleteNotification({ body }) {
    const { postId, type } = body;

    await Notification.deleteOne({ post: postId, type });

    return true;
  }

  async setView({ userId }) {
    await Notification.updateMany(
      { to: userId, isView: { $ne: true } },
      { isView: true }
    );

    return { status: "success" };
  }
}

module.exports = new NotificationService();
