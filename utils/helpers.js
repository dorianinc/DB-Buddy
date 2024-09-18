const path = require('path');
const fs = require('fs').promises;

const writeToFile = async (envFormat, file, data) => {
  let filePath = path.resolve(__dirname, "..", "data", file);

  if (envFormat) {
    data = convertForEnv(data); 
    filePath = path.resolve(__dirname, "..", file);
  }

  try {
    await fs.writeFile(filePath, file === ".env" ? data : JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to file:", err);
    throw err;
  }
};

// Extracted function to convert object keys/values into .env format
function convertForEnv(data) {
  let envData = "";
  for (const key in data) {
    const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toUpperCase().trim();
    envData += `${snakeCaseKey}="${data[key]}"\n`;
  }
  return envData; 
}

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
  readFromFile,
};
