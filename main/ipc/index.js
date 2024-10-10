const fs = require("fs");
const path = require("path");

// Get the directory name of the current file (where the ipc/index.js is located)
const ipcDir = __dirname;

// Object to store all IPC listener functions
const ipcListeners = {};

// Read all files in the ipc directory
fs.readdirSync(ipcDir)
  .filter((file) => {
    // Filter out any non-JS files and this index.js file itself
    return (
      file !== "index.js" &&
      file.indexOf(".") !== 0 && // Ignore hidden files
      file.slice(-3) === ".js" // Only consider .js files
    );
  })
  .forEach((file) => {
    // Import each file and add the function to ipcListeners
    const listener = require(path.join(ipcDir, file));

    // Assuming each file exports a function to be invoked
    const listenerName = path.basename(file, ".js"); // Get the base name of the file without .js
    ipcListeners[listenerName] = listener;
  });

// Function to deploy all IPC listeners
const deployIPCListeners = () => {
  // Iterate over all listeners and invoke them
  Object.keys(ipcListeners).forEach((key) => {
    if (typeof ipcListeners[key] === "function") {
      ipcListeners[key](); // Call the listener function
    }
  });
};

module.exports = deployIPCListeners;
