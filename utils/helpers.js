const path = require("path");
const fs = require("fs").promises;

const writeToFile = async (fileName, data, format = "plain" ) => {
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
    fs.writeFile(filePath, dataToWrite);
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
  console.log("🖥️  fileName: ", fileName)
  const filePath = path.resolve(__dirname, "..", "data", fileName);
  try {
    const data = await fs.readFile(filePath, "utf8");
    return data;
  } catch (err) {
    // Handle the error appropriately
    console.error("Error reading from file:", err);
    throw err;
  }
};


const convertToCamelCase = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}


module.exports = {
  writeToFile,
  readFromFile,
  convertToCamelCase
};
