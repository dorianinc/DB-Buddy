const axios = require("axios");
const baseUrl = "https://api.render.com/v1";
const options = require("./configs");

// Helpers --------------------------------------------------------------------------------------------

const validateVariables = async () => {
  let missing = [];

  if (!databaseName) {
    missing.push("databaseName");
  }
  if (!databaseKey) {
    missing.push("databaseKey");
  }
  if (!region) {
    missing.push("region");
  }
  if (!baseUrl) {
    missing.push("baseUrl");
  }
  if (!key) {
    missing.push("key");
  }

  if (missing.length) {
    return false;
  }
  return true;
};

const updateEnvVariable = async (serviceId, envKey, envValue) => {
  const body = {
    value: envValue,
  };

  try {
    const response = await axios.put(
      `${baseUrl}/services/${serviceId}/env-vars/${envKey}`,
      body,
      options
    );
    return response.data;
  } catch (error) {
    console.error("error ==> ", error)
    handleError(error, "updateEnvVariable");
  }
};

const deployService = async (service) => {
  const body = {
    clearCache: "do_not_clear",
  };

  try {
    const response = await axios.post(
      `${baseUrl}/services/${service.id}/deploys`,
      body,
      options
    );
    return response.data;
  } catch (error) {
    handleError(error, "deployServices");
  }
};

const handleError = (error, functionName) => {
  const statusCode = error.response?.status;
  const errorMessage =
    error.response?.data?.message || "An unknown error occurred";

  console.error(
    `Error in ${functionName}: ${errorMessage} ${
      !statusCode ? "" : `Status code: ${statusCode}`
    }`
  );

  throw new Error(
    `Error in ${functionName}: ${errorMessage} ${
      !statusCode ? "" : `Status code: ${statusCode}`
    }`
  );
};

const isEmpty = (obj) => {
  return Object.values(obj).length === 0;
};

module.exports = {
  validateVariables,
  updateEnvVariable,
  deployService,
  isEmpty,
  handleError,
};
