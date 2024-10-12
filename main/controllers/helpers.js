const axios = require("axios");
const { getConfigs } = require("./configs");

// Helpers --------------------------------------------------------------------------------------------

const updateEnvVariable = async (serviceId, envKey, envValue) => {
  const body = {
    value: envValue,
  };

  try {
    const response = await axios.put(
      `${getConfigs().render.baseUrl}/services/${serviceId}/env-vars/${envKey}`,
      body,
      getConfigs().options
    );
    return response.data;
  } catch (error) {
    console.error("updateEnvVariabl: ", error);
    throw error;
  }
};

const deployService = async (service) => {
  const body = {
    clearCache: "do_not_clear",
  };

  try {
    const response = await axios.post(
      `${getConfigs().render.baseUrl}/services/${service.id}/deploys`,
      body,
      getConfigs().options
    );
    return response.data;
  } catch (error) {
    console.error("error in deployService: ", error);
    throw error;
  }
};

const isEmpty = (obj) => {
  if (obj == null) return true;
  return Object.values(obj).length === 0;
};

module.exports = {
  updateEnvVariable,
  deployService,
  isEmpty,
};
