require("dotenv").config();

const key = process.env.RENDER_API_KEY; // render API key

const options = {
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
    authorization: `Bearer ${key}`,
  },
};

module.exports = options;