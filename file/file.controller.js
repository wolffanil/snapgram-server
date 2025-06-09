const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;
const catchAsync = require("../utils/catchAsync");

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
});

exports.uploadPhoto = upload.single("image");

exports.resizePhoto = catchAsync(async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({
        status: "error",
        message: "Файл должен быть",
      });

    const folder = req.query.folder;

    req.file.filename = `${folder}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`upload/${folder}/${req.file.filename}`);

    res.status(200).json({
      status: "seccess",
      imageUrl: `upload/${folder}/${req.file.filename}`,
    });
  } catch (error) {
    console.log(error);
  }
});

exports.deletePhoto = catchAsync(async (req, res) => {
  const photoId = req.params.photoId;
  const folder = req.query.folder;

  const filePath = path.join(__dirname, `/upload/${folder}/`, photoId);

  await fs.unlink(filePath);
  res.status(200).json({
    status: "seccess",
  });
});
