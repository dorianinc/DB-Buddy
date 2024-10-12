const axios = require("axios");
const { getConfigs } = require("./configs");

// Owner --------------------------------------------------------------------------------------------

const fetchOwner = async () => {
  try {
    const response = await axios.get(
      `${getConfigs().render.baseUrl}/owners?limit=1`,
      getConfigs().options
    );
    if (response.status === 200) {
      const { owner } = response.data[0];
      return owner;
    }
  } catch (error) {
    console.error("error in fetchOwner: ", {
      message: error.message,
      statusCode: error.status,
      method: error.request.method,
    });
    throw {
      message: error.message,
      statusCode: error.status,
      method: error.request.method,
    };
  }
};

module.exports = { fetchOwner };
