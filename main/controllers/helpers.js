const axios = require("axios");
const { getConfigs } = require("./configs");

// Helpers --------------------------------------------------------------------------------------------

const updateEnvVariable = async (serviceId, envKey, envValue) => {
  try {
    const { render, options } = getConfigs();
    const body = { value: envValue };
    const response = await axios.put(
      `${render.baseUrl}/services/${serviceId}/env-vars/${envKey}`,
      body,
      options
    );
    return response.data;
  } catch (error) {
    console.error("error in updateEnvVariable");
    throw {
      message: error.response?.data,
      statusCode: error.status,
      method: error.request?.method,
    };
  }
};

const deployService = async (service) => {
  try {
    const { render, options } = getConfigs();
    const body = { clearCache: "do_not_clear" };
    const response = await axios.post(
      `${render.baseUrl}/services/${service.id}/deploys`,
      body,
      options
    );
    return response.data;
  } catch (error) {
    console.error("error in deployService");
    throw {
      message: error.response?.data,
      statusCode: error.status,
      method: error.request?.method,
    };
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
