const app = require("./index.js");
const User = require("./user/user.model.js");
const connectToDatabase = require("./config/db.connect.js");
const Message = require("./message/message.model.js");

connectToDatabase();

const port = process.env.PORT || 4000;

const server = app.listen(port, console.log(`server working on port ${port}`));

const io = require("socket.io")(server, {
  // pingTimeout: 60000 * 60,
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

io.on("connection", (socket) => {
  socket.on("setup", ({ userData }) => {
    socket.join(userData._id);
  });

  socket.on("signin", (userId) => {
    socket.to(userId).emit("signin");
  });

  socket.on("online", ({ users, id }) => {
    users.forEach((user) => {
      if (user._id === id) return;
      socket.to(user._id).emit("online", id);
    });
  });

  socket.on("offline", ({ users, id }) => {
    users.forEach((user) => {
      if (user._id === id) return;
      socket.to(user._id).emit("offline", id);
    });

    const handleOffline = async () => {
      await User.findByIdAndUpdate(id, { isOnline: false });
    };

    handleOffline();
  });

  socket.on("deleteDevice", ({ myId, sessionId }) => {
    console.log(myId, sessionId);
    socket.to(myId).emit("deleteMyDevice", sessionId);
  });

  socket.on("new message", ({ newMessage, chat }) => {
    if (!chat.users) return;

    chat.users.forEach((user) => {
      // if (user._id === newMessage.sender._id) return;

      socket
        .to(user._id)
        .emit("message recieved", { chatId: chat._id, message: newMessage });
    });
  });

  socket.on("readMessages", ({ userId, chatId }) => {
    const readMessages = async () => {
      await Message.updateMany(
        { chat: chatId, sender: userId },
        {
          isRead: true,
        }
      );
    };

    readMessages();

    socket.to(userId).emit("readMessages", chatId);
  });

  socket.on("stop typing", ({ userId, chatId }) => {
    socket.to(userId).emit("stop typing", chatId);
  });

  socket.on("typing", ({ userId, chatId }) => {
    socket.to(userId).emit("typing", chatId);
  });

  socket.on("action message", ({ chat, userId, type, messageId, text }) => {
    if (!chat.users) return;

    chat.users.forEach((user) => {
      // if (user._id === userId) return;

      socket
        .to(user._id)
        .emit("action message", { chatId: chat._id, type, messageId, text });
    });
  });

  socket.on("createGroup", ({ users, chatName, groupAdmin }) => {
    if (!users) return;
    users.forEach((user) => {
      if (user === groupAdmin) return;
      socket.to(user).emit("createGroup", chatName);
    });
  });

  socket.on("addToGroup", ({ userId, chatName, usersGroup }) => {
    socket.to(userId).emit("addToGroup", chatName);
    if (!usersGroup) return;
    usersGroup.forEach((user) => {
      if (user === userId) return;
      socket.to(user).emit("newUserInGroup");
    });
  });

  socket.on("removeFromGroup", ({ userId, chatId, chatName, usersGroup }) => {
    if (!chatId) return;
    socket.to(userId).emit("removeFromGroup", { chatId, chatName });
    if (!usersGroup) return;
    usersGroup.forEach((user) => {
      if (usersGroup === userId) return;
      socket.to(user).emit("deleteUserInGroup", { chatId, userId });
    });
  });

  socket.on("sendNewNotification", ({ notificaion, to: userId }) => {
    socket.to(userId).emit("getNewNotification", notificaion);
  });

  socket.on("sendRemoveNotification", ({ to: userId, postId, type }) => {
    socket.to(userId).emit("removeNotification", { postId, type });
  });

  socket.on("sendSayHello", ({ myId, sessionId }) => {
    socket.to(myId).emit("acceptSayHello", sessionId);
  });

  socket.on("resetPassword", (userId) => {
    socket.to(userId).emit("resetPassword");
  });

  socket.on("trySignIn", (email) => {
    const getUserId = async () => {
      let user = await User.findOne({ email }).lean();

      if (!user?._id) return;
      const userId = user._id.toString();

      socket.to(userId).emit("trySignInYourAccount");
    };

    getUserId();
  });

  socket.on("updatePassword", ({ sessionIds, userId }) => {
    sessionIds.forEach((sessionId) => {
      socket.to(userId).emit("deleteMyDevice", sessionId);
    });
  });

  socket.on("scanQr", ({ key, token }) => {
    socket.to(key).emit("giveTokenQr", token);
  });

  socket.on("createRoomQr", (key) => {
    socket.join(key);
  });

  socket.on("deleteRoomQr", (key) => {
    socket.leave(key);
  });

  socket.on("leaveRoom", (id) => {
    socket.leave(id);
  });
});
