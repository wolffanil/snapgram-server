const Chat = require("../chat/chat.model");
const AppError = require("../utils/AppError");
const Message = require("./message.model");

class MessageService {
  async getAllMessages({ params }) {
    const { chatId } = params;

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "_id imageUrl name")
      .populate({
        path: "post",
        select: "_id caption imageUrl location createdAt",
        populate: { path: "creator", select: "_id name imageUrl" },
      })
      .lean();

    return messages;
  }

  async createNewMessage({ body, user, next }) {
    const { chat, content, repostText, post, type } = body;

    if (!chat) return next(new AppError("Неверные данные", 400));

    const message = await Message.create({
      sender: user.id,
      content,
      chat,
      post,
      repostText,
      type,
    });

    await Chat.findByIdAndUpdate(chat, { latestMessage: message });

    return message;
  }

  async deleteMesage({ messageId, chatId }) {
    await Message.findByIdAndDelete(messageId);

    const latestMessage = await Message.findOne({ chat: chatId })
      .sort({ createdAt: -1 })
      .select("_id")
      .lean();

    await Chat.findOneAndUpdate(
      { _id: chatId, latestMessage: messageId },
      { latestMessage: latestMessage?._id ? latestMessage._id : undefined }
    );

    return true;
  }

  async editMessage({ messageId, body, senderId }) {
    const { type, text } = body;

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        sender: senderId,
      },
      {
        [type === "repost" ? "repostText" : "content"]: text,
      },
      { new: true }
    );

    return message;
  }

  async readMessages({ body }) {
    const chatId = body;

    if (!chatId) {
      throw new AppError("Chat ID must be", 404);
    }

    await Message.updateMany(
      { chat: chatId },
      {
        isRead: true,
      }
    );

    return true;
  }
}

module.exports = new MessageService();
