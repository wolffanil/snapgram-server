const express = require("express");
const {
  getUserById,
  getUserLikedPosts,
  updateUser,
  getUsers,
  deleteToken,
  getMyTokens,
  updatePassword,
  getAll,
  setBan,
  setUnBan,
} = require("./user.controller.js");

const saveRouter = require("../save/save.routes.js");
const protect = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.route("/admin").get(getAll);
router.route("/admin/setBan/:id").patch(setBan);
router.route("/admin/setUnBan/:id").patch(setUnBan);

router.use(protect);

router.use("/:userId/saves", saveRouter);

router.route("/search").get(getUsers);

router.route("/my-tokens").get(getMyTokens);

router.route("/liked-posts").get(getUserLikedPosts);

router.route("/update-profile").patch(updateUser);

router.route("/:userId").get(getUserById);

router.route("/update-password").post(updatePassword);

router.route("/").get(getUsers);

router.route("/deleteMyToken/:tokenId").delete(deleteToken);

module.exports = router;
