const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const Fingerprint = require("express-fingerprint");
const morgan = require("morgan");
const compression = require("compression");
const { graphqlHTTP } = require("express-graphql");
const mongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");

const AppError = require("./utils/AppError");

const authRouter = require("./auth/auth.routes");
const photoRouter = require("./file/file.routes");
const postRouter = require("./post/post.routes");
const saveRouter = require("./save/save.routes");
const likeRouter = require("./like/like.routes");
const globalError = require("./config/error.config");
const commentRouter = require("./comment/comment.routes");
const userRouter = require("./user/user.routes");
const chatRouter = require("./chat/chat.routes");
const messageRouter = require("./message/message.routes");
const subscribeRouter = require("./subscribe/subscribe.routes");
const notificationRouter = require("./notification/notification.routes");

const schema = require("./graphql/query/index");
const protect = require("./middlewares/auth.middleware");

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "production") {
  app.enable("trust proxy");
}

app.get("/favicon.ico", (req, res) => {
  res.status(204);
});

app.get("/", (req, res) => {
  res.send("hello from server");
});

app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    exposedHeaders: "set-cookie",
  })
);
app.use(express.json({ limit: "10kb" }));

app.use(xss());

app.use(
  Fingerprint({
    parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders],
  })
);

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use("/upload", express.static(path.join(__dirname, "upload")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());
app.use(mongoSanitize());
app.use(compression());

app.use(
  "/api/v1/graphql",
  protect,
  graphqlHTTP((req) => ({
    schema,
    graphiql: process.env.NODE_ENV === "development" && true,
    context: {
      user: req.user,
    },
  }))
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/photo", photoRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/saves", saveRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/subscribers", subscribeRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can dont use this ${req.originalUrl}`, 404));
});

app.use(globalError);

module.exports = app;
