require("dotenv").config();
const axios = require("axios");
const options = require("./configs");
const baseUrl = "https://api.render.com/v1";
const { formatDistanceToNow } = require("date-fns");
const { store } = require("../store");

// Service --------------------------------------------------------------------------------------------

const fetchServices = async (refresh) => {
  try {
    const storedServices = !refresh && store.get("services");
    console.log("🖥️  storedServices: ", storedServices);
    if (storedServices && !isEmpty(storedServices)) return storedServices;

    const response = await axios.get(`${baseUrl}/services`, options);

    const rawServices = await response.data
      .filter((item) => item.service.type === "web_service")
      .map((item) => item.service)
      .filter((service) => service !== null);

    const services = {};
    for (let service of rawServices) {
      const { id, name, type } = service;
      const obj = { id, name, type };
      obj.status = !refresh ? await checkServiceStatus(service) : "deploying";
      obj.lastDeployed = formatDistanceToNow(service.updatedAt);
      services[service.name] = obj;
    }
    store.set("services", services);
    return services;
  } catch (error) {
    handleError(error, "fetchServices");
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

const checkServiceStatus = async (service) => {
  return new Promise(async (resolve) => {
    try {
      let serviceStatus = "deploying";
      while (serviceStatus === "deploying") {
        await new Promise((timeoutResolve) =>
          setTimeout(timeoutResolve, 10000)
        );
        const response = await axios.get(
          `${baseUrl}/services/${service.id}/events?limit=10`,
          options
        );
        const event = response.data[0].event;
        const eventType = event.type;
        const statusCode = event.details.status;
        if (eventType === "deploy_ended") {
          switch (statusCode) {
            case 2:
              serviceStatus = "deployed";
              break;
            case 3:
              serviceStatus = "not deployed";
              break;
            default:
              serviceStatus = "error";
          }
        }
      }
      resolve(serviceStatus);
    } catch (error) {
      handleError(error, "fetchServiceEvents");
      resolve("error");
    }
  });
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

function isEmpty(obj) {
  return Object.values(obj).length === 0;
}

module.exports = {
  fetchServices,
  deployService,
  checkServiceStatus,
};
