const fs = require("fs").promises;
const path = require("path");

const writeToFile = async (file, data) => {
  const filePath = path.resolve(__dirname, "..", "data", file);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    // Handle the error appropriately
    console.error("Error writing to file:", err);
    throw err;
  }
};

const readFromFile = async (file) => {
  const filePath = path.resolve(__dirname, "..", "data", file);
  try {
    const data = await fs.readFile(filePath, "utf8");
    return data;
  } catch (err) {
    // Handle the error appropriately
    console.error("Error reading from file:", err);
    throw err;
  }
};

module.exports = {
  writeToFile,
  readFromFile
};
