const catchAsync = require("../utils/catchAsync");
const chatService = require("./chat.service");

class ChatController {
  accessChat = catchAsync(async (req, res, next) => {
    const { userId } = req.body;
    const user = req.user.id;

    const chat = await chatService.accessChat({ user, userId });

    res.status(200).json(chat);
  });

  getMyChats = catchAsync(async (req, res, next) => {
    const user = req.user.id;

    const chats = await chatService.getMyChats({ user });

    res.status(200).json(chats);
  });

  createGroupChat = catchAsync(async (req, res, next) => {
    const user = req.user.id;
    const body = req.body;

    const chat = await chatService.createGroupChat({ body, user, next });

    res.status(201).json(chat);
  });

  addToGroup = catchAsync(async (req, res, next) => {
    const body = req.body;

    const chat = await chatService.addToGroup({ body, next });

    res.status(200).json(chat);
  });

  removeFromGroup = catchAsync(async (req, res, next) => {
    const body = req.body;

    const chat = await chatService.removeFromGroup({ body, next });

    res.status(200).json(chat);
  });

  changeDataGroup = catchAsync(async (req, res, next) => {
    const params = req.params;
    const body = req.body;

    const chat = await chatService.changeDataGroup({ params, body, next });

    res.status(200).json(chat);
  });
}

module.exports = new ChatController();
