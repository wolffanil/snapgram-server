const catchAsync = require("../utils/catchAsync");
const notificationService = require("./notification.service");

class NotificationController {
  getMy = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const notifications = await notificationService.getMy({ userId });

    res.status(200).json(notifications);
  });

  createNotification = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const notification = await notificationService.createNotification({
      userId,
      body: req.body,
      next,
    });

    res.status(201).json(notification);
  });

  deleteNotifications = catchAsync(async (req, res, next) => {
    const body = req.body;

    await notificationService.deleteNotification({ body });

    res.status(204).json({ status: "success" });
  });

  setIsView = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    await notificationService.setView({ userId });

    res.status(200).json({
      status: "success",
    });
  });
}

module.exports = new NotificationController();
