const axios = require("axios");
const { getConfigs } = require("./configs");

// Owner --------------------------------------------------------------------------------------------

const fetchOwner = async () => {
  try {
    const { render, options } = getConfigs();
    const response = await axios.get(
      `${render.baseUrl}/owners?limit=1`,
      options
    );
    if (response.status === 200) {
      const { owner } = response.data[0];
      return owner;
    }
  } catch (error) {
    console.error("error in fetchOwner");
    throw {
      message: error.response?.data,
      statusCode: error.status,
      method: error.request?.method,
    };
  }
};

module.exports = { fetchOwner };
