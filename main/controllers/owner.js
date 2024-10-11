const axios = require("axios");
const { render, options } = require("./configs");

// Owner --------------------------------------------------------------------------------------------

const fetchOwner = async () => {
  try {
    const response = await axios.get(
      `${render.baseUrl}/owners?limit=1`,
      options
    );
    if (response.status === 200) {
      const { owner } = response.data[0];
      return owner;
    }
  } catch (error) {
    console.error("error in fetchOwner: ", error);
    throw error;
  }
};

module.exports = { fetchOwner };
