const express = require("express");
const { createSave, deleteSave, getAllSaves } = require("./save.controller.js");
const protect = require("../middlewares/auth.middleware.js");

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route("/").get(getAllSaves).post(createSave);

router.route("/:saveId").delete(deleteSave);

module.exports = router;
