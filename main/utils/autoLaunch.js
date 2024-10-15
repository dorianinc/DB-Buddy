const { app } = require("electron");
const { store } = require("../store");
const AutoLaunch = require("auto-launch");
const isDev = !app.isPackaged;

function handleAutoLaunch() {
  if (!isDev) {
    const appAutoLauncher = new AutoLaunch({
      name: "DB Buddy",
      path: app.getPath("exe"),
    });

    const autoLaunchEnabled = store.get("settings.autoLaunch");
    
    appAutoLauncher
    .isEnabled()
    .then((isEnabled) => {
        if (autoLaunchEnabled && !isEnabled) {
          appAutoLauncher
            .enable()
            .then(() => {
              console.log("Auto-launch enabled.");
            })
            .catch((err) => {
              console.error("Failed to enable auto-launch:", err);
            });
        } else if (!autoLaunchEnabled && isEnabled) {
          appAutoLauncher
            .disable()
            .then(() => {
              console.log("Auto-launch disabled.");
            })
            .catch((err) => {
              console.error("Failed to disable auto-launch:", err);
            });
        } else {
          console.log("Auto-launch setting is already configured correctly.");
        }
      })
      .catch((err) => {
        console.error("Failed to check auto-launch status:", err);
      });
  }
}

module.exports = {
  handleAutoLaunch,
};
