const axios = require("axios");
const { getConfigs } = require("./configs");
const { store } = require("../store");
const { isEmpty } = require("./helpers");

// Service --------------------------------------------------------------------------------------------

const fetchServices = async () => {
  try {
    const { render, options } = getConfigs();
    const response = await axios.get(`${render.baseUrl}/services`, options);
    if (isEmpty(response.data)) return null;

    const rawServices = response.data
      .filter((item) => item.service.type === "web_service")
      .map((item) => item.service)
      .filter((service) => service !== null);

    const services = {};
    for (let service of rawServices) {
      const { id, name, type } = service;
      const obj = { id, name, type };

      obj.status = "deploying";
      services[service.name] = obj;
    }

    store.set("services", services);
    return services;
  } catch (error) {
    console.error("error in fetchServices");
    throw {
      message: error.response?.data,
      statusCode: error.status,
      method: error.request?.method,
    };
  }
};

const checkServiceStatus = async (services) => {
  try {
    const { render, options } = getConfigs();
    await Promise.allSettled(
      Object.values(services).map(async (service) => {
        try {
          const inProgress = ["update_in_progress", "build_in_progress"];
          let serviceStatus = service.status || "deploying";

          while (serviceStatus === "deploying") {
            await new Promise((timeoutResolve) =>
              setTimeout(timeoutResolve, 10000)
            );
            const response = await axios.get(
              `${render.baseUrl}/services/${service.id}/deploys?limit=20`,
              options
            );
            const deployStatus = response.data[0].deploy.status;

            if (!inProgress.includes(deployStatus)) {
              switch (deployStatus) {
                case "live":
                  serviceStatus = "deployed";
                  break;
                case "build_failed":
                case "update_failed":
                case "pre_deployed_failed":
                case "deactivated":
                  serviceStatus = "not deployed";
                  break;
                default:
                  serviceStatus = "error";
              }
            }
          }
          store.set(`services.${service.name}.status`, serviceStatus);
        } catch (error) {
          store.set(`services.${service.name}.status`, "error");
          console.error(`Error checking service ${service.name}`);
          throw {
            message: error.response?.data,
            statusCode: error.status,
            method: error.request?.method,
          };
        }
      })
    );
  } catch (error) {
    console.error("Error during background service checks");
    throw {
      message: error.response?.data,
      statusCode: error.status,
      method: error.request?.method,
    };
  }
};

module.exports = {
  fetchServices,
  checkServiceStatus,
};
