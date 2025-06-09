const catchAsync = require("../utils/catchAsync");

const session = catchAsync(async (req, res, next) => {
  const { fingerprint } = req;
  if (!req._dataDevice) {
    req._dataDevice = {};
  }

  req._dataDevice.fingerprint = fingerprint.hash;

  const type = req.headers.type || "";

  if (type === "mobile") {
    req._dataDevice.brand = req.headers.brand;
    req._dataDevice.model = req.headers.model;
    req._dataDevice.device = req.headers.device;
    req._dataDevice.type = "mobile";
    req._dataDevice.browser = undefined;
  } else {
    req._dataDevice.type = "browser";
    req._dataDevice.device = fingerprint.components.useragent.os.family;
    req._dataDevice.browser = fingerprint.components.useragent.browser.family;
    req._dataDevice.brand = undefined;
    req._dataDevice.model = undefined;
  }
  next();
});

module.exports = session;
