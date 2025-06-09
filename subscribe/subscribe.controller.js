const catchAsync = require("../utils/catchAsync");
const subscribeService = require("./subscribe.service");

class SubscribeContoller {
  getSubscriptions = catchAsync(async (req, res, next) => {
    const userId = req.query.userId || req.user.id;

    const subscribers = await subscribeService.getSubscriptions(userId);

    res.status(200).json(subscribers);
  });

  getSubscribers = catchAsync(async (req, res, next) => {
    const userId = req.query?.userId || req.user.id;

    const subscribers = await subscribeService.getSubscribers(userId);

    res.status(200).json(subscribers);
  });

  deleteSubscribe = catchAsync(async (req, res, next) => {
    const userId = req.body.userId;

    const subscriberId = req.user.id;

    const subscribe = await subscribeService.delete(subscriberId, userId);

    res.status(204).json(subscribe);
  });

  createSubscribe = catchAsync(async (req, res, next) => {
    const userId = req.body.userId;

    const subscriberId = req.user.id;

    const subscribe = await subscribeService.create(subscriberId, userId);

    res.status(201).json(subscribe);
  });
}

module.exports = new SubscribeContoller();
