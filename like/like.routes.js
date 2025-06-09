const express = require("express");
const { createLike, deleteLike } = require("./like.contoller.js");
const protect = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.use(protect);

router.route("/").post(createLike);
router.route("/:likeId").delete(deleteLike);

module.exports = router;
