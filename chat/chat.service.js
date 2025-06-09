const Message = require("../message/message.model");
const User = require("../user/user.model");
const AppError = require("../utils/AppError");
const Chat = require("./chat.model");

class ChatService {
  async accessChat({ user, userId }) {
    const existChat = await this.existChat({ user, userId });

    if (existChat.length > 0) {
      return existChat[0];
    }

    return this.createNewChat({ user, userId });
  }

  async createNewChat({ user, userId }) {
    const createdChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [user, userId],
      background: "",
    });

    const FullChat = await Chat.findOne({ _id: createdChat._id })
      .populate("users", this.returnCurrentUserData())
      .lean();

    return FullChat;
  }

  async existChat({ user, userId }) {
    let isChat = await Chat.find({
      isGroupChat: false,
      users: { $all: [user, userId] },
    })
      .populate("users", this.returnCurrentUserData())
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: this.returnCurrentUserData(),
    });

    return isChat;
  }

  async getMyChats({ user }) {
    let chats = await Chat.find({ users: { $elemMatch: { $eq: user } } })
      .populate("users", this.returnCurrentUserData())
      .populate("groupAdmin", this.returnCurrentUserData())
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .lean();

    const chatIds = chats.map((chat) => chat._id);

    const unreadMessagesCount = await Message.aggregate([
      {
        $match: {
          chat: { $in: chatIds },
          isRead: false,
          sender: { $ne: user },
        },
      },
      { $group: { _id: "$chat", count: { $sum: 1 } } },
    ]);

    const unreadCountMap = unreadMessagesCount.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // chats = chats.map((chat) => ({
    //   ...chat,
    //   unreadMessagesCount: unreadCountMap[chat._id] || 0,
    // }));

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: this.returnCurrentUserData(),
    });

    chats = chats.map((chat) => ({
      ...chat,
      unreadMessagesCount:
        chat?.latestMessage?.sender?._id.toString() === user
          ? 0
          : unreadCountMap[chat._id] || 0,
    }));

    return chats;
  }

  async createGroupChat({ body, user, next }) {
    const { clients, chatName, background } = body;

    if (!clients || !chatName)
      return next(new AppError("Пожалуйста заполните все поля", 400));

    let users = JSON.parse(clients);

    if (users.length < 2) {
      return next(new AppError("Должно быть больше 2 участиков", 400));
    }

    users.push(user.id);

    const groupChat = await Chat.create({
      chatName,
      users,
      isGroupChat: true,
      groupAdmin: user,
      background,
    });

    const fullGropChat = await Chat.findById(groupChat._id)
      .populate("users", this.returnCurrentUserData())
      .populate("groupAdmin", this.returnCurrentUserData());

    return fullGropChat;
  }

  async addToGroup({ body, next }) {
    const { chatId, userId } = body;

    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    );

    if (!added) return next(new AppError("Чат не был найден", 404));

    return added;
  }

  async changeDataGroup({ params, body, next }) {
    const { chatId } = params;
    const { chatName, background } = body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
        background,
      },
      {
        new: true,
      }
    );

    if (!updatedChat) return next(new AppError("Чат не был найден", 404));

    return updatedChat;
  }

  async removeFromGroup({ body, next }) {
    const { chatId, userId } = body;

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    );

    if (!removed) return next(new AppError("Чат не бал найден", 404));

    return removed;
  }

  returnCurrentUserData() {
    const str = "_id name username email imageUrl isOnline updatedAt";

    return str;
  }
}

module.exports = new ChatService();
