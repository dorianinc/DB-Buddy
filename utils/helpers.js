const path = require("path");
const fs = require("fs");

const writeToFile = async (fileName, data, format = "plain") => {
  try {
    let filePath;
    let dataToWrite;

    // Assign values to filePath and dataToWrite based on the format
    switch (format) {
      case "json":
        if (typeof data === "object") {
          filePath = path.resolve(__dirname, "..", "data", fileName);
          dataToWrite = JSON.stringify(data, null, 2);
        } else {
          throw new Error("Data must be an object for JSON format.");
        }
        break;
      case "env":
        if (typeof data === "object") {
          filePath = path.resolve(__dirname, "..", fileName);
          dataToWrite = convertToEnv(data);
        } else {
          throw new Error("Data must be an object for ENV format.");
        }
        break;
      case "plain":
      default:
        filePath = path.resolve(__dirname, "..", "data", fileName);
        dataToWrite = data;
    }

    // Write the data to the file here
    fs.writeFileSync(filePath, dataToWrite);
    console.log("File written successfully:", filePath);
  } catch (err) {
    console.error("Error writing to file:", err);
    throw err;
  }
};

// Extracted function to convert object keys/values into .env format
function convertToEnv(data) {
  let envData = "";
  for (const key in data) {
    const snakeCaseKey = key
      .replace(/([A-Z])/g, "_$1")
      .toUpperCase()
      .trim();
    envData += `${snakeCaseKey}="${data[key]}"\n`;
  }
  return envData;
}

const readFromFile = async (fileName) => {
  console.log("🖥️  fileName: ", fileName);
  try {
    const filePath = path.resolve(__dirname, "..", "data", fileName);
    if (fs.existsSync(filePath)) {
      console.log("file does exist");
      const data = fs.readFileSync(filePath, "utf8");
      return data;
    } else {
      console.log("file does not exist");
      return null;
    }
  } catch (err) {
    // Handle the error appropriately
    console.error("Error reading from file:", err);
    throw err;
  }
};

module.exports = {
  writeToFile,
  readFromFile,
};
