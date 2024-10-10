require("dotenv").config();
const axios = require("axios");
const options = require("./configs");

const baseUrl = "https://api.render.com/v1";

// Owner --------------------------------------------------------------------------------------------

const fetchOwner = async () => {
  try {
    const response = await axios.get(`${baseUrl}/owners?limit=1`, options);
    if (response.status === 200) {
      const { owner } = response.data[0];
      return owner;
    }
  } catch (error) {
    console.error("error in fetchOwner: ", error);
    throw error
  }
};

module.exports = { fetchOwner };
