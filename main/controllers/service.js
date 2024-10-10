const axios = require("axios");
const options = require("./configs");
const { isEmpty } = require("./helpers");
const { formatDistanceToNow } = require("date-fns");
const { store } = require("../store");

const baseUrl = "https://api.render.com/v1";

// Service --------------------------------------------------------------------------------------------

const fetchServices = async (refresh) => {
  try {
    const storedServices = !refresh && store.get("services");
    if (storedServices && !isEmpty(storedServices)) return storedServices;

    const response = await axios.get(`${baseUrl}/services`, options);
    const rawServices = response.data
      .filter((item) => item.service.type === "web_service")
      .map((item) => item.service)
      .filter((service) => service !== null);

    const services = {};
    for (let service of rawServices) {
      const { id, name, type } = service;
      const obj = { id, name, type };

      obj.status = "deploying";
      obj.lastDeployed = formatDistanceToNow(service.updatedAt);

      services[service.name] = obj;
    }

    store.set("services", services);
    listenToServiceStatus(services);
    return services;
  } catch (error) {
    console.error("error in fetchServices: ", error);
    return {}
  }
};

const listenToServiceStatus = async (services) => {
  try {
    await Promise.allSettled(
      Object.values(services).map((service) =>
        checkServiceStatus(service).catch((err) => {
          console.error(`Error checking service ${service}:`, err);
        })
      )
    );
  } catch (error) {
    console.error("Error during background service checks:", error);
    throw error;
  }
};

const checkServiceStatus = async (service) => {
  return new Promise(async (resolve) => {
    try {
      let serviceStatus = service.status || "deploying";
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
      store.set(`services.${service.name}.status`, serviceStatus);
      resolve(serviceStatus);
    } catch (error) {
      console.error("error in checkServiceStatus: ", error);
      resolve("error");
    }
  });
};

module.exports = {
  fetchServices,
  checkServiceStatus,
  listenToServiceStatus,
};
