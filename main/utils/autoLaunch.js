const { app } = require("electron");
const { store } = require("../store");
const AutoLaunch = require("auto-launch");
const isDev = !app.isPackaged;

function handleAutoLaunch() {
  if (isDev) {
    const appAutoLauncher = new AutoLaunch({
      name: "DB Buddy", // Replace with your app's name
      path: app.getPath("exe"), // Auto-launch the app executable
    });

    // Retrieve the auto-launch setting from your store
    const autoLaunchEnabled = store.get("settings.autoLaunch");
    
    // Handle enabling or disabling auto-launch based on the setting
    appAutoLauncher
    .isEnabled()
    .then((isEnabled) => {
        if (autoLaunchEnabled && !isEnabled) {
          // If auto-launch is enabled in settings but not enabled in the system, enable it
          appAutoLauncher
            .enable()
            .then(() => {
              console.log("Auto-launch enabled.");
            })
            .catch((err) => {
              console.error("Failed to enable auto-launch:", err);
            });
        } else if (!autoLaunchEnabled && isEnabled) {
          // If auto-launch is disabled in settings but enabled in the system, disable it
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
