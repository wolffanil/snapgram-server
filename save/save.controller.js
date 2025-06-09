const catchAsync = require("../utils/catchAsync");
const saveService = require("./save.service");

class SaveController {
  getAllSaves = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const saves = await saveService.getAllSaves({ userId });

    res.status(200).json(saves);
  });

  deleteSave = catchAsync(async (req, res, next) => {
    const saveId = req.params.saveId;

    await saveService.deleteSave({ saveId });

    res.status(204).json({
      status: "success",
    });
  });

  createSave = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { postId } = req.body;

    const save = await saveService.createSave({ postId, userId });

    res.status(201).json(save);
  });
}

module.exports = new SaveController();
