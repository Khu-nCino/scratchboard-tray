const fs = require("fs");
const path = require("path");
const electron_notarize = require("electron-notarize");

module.exports = async function(params) {
  console.log(params);
  if (params.electronPlatformName !== 'darwin' || process.env.NOTARIZE !== 'true') {
    return;
  }
  let appId = "com.github.gabriel-keith.scratchboard-tray";

  let appPath = path.join(
    params.appOutDir,
    `${params.packager.appInfo.productFilename}.app`
  );
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  console.log(`Notarizing ${appId} found at ${appPath}`);

  try {
    await electron_notarize.notarize({
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.appleId,
      appleIdPassword: process.env.appleIdPassword
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${appId}`);
};
