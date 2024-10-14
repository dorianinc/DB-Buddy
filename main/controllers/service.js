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
          let serviceStatus = service.status || "deploying";

          // Poll the service status while it's "deploying"
          while (serviceStatus === "deploying") {
            // Wait 10 seconds before the next status check
            await new Promise((timeoutResolve) =>
              setTimeout(timeoutResolve, 10000)
            );

            // Fetch the service events
            const response = await axios.get(
              `${render.baseUrl}/services/${service.id}/events?limit=10`,
              options
            );
            const event = response.data[0].event;
            const eventType = event.type;
            const statusCode = event.details.status;

            // Update the status based on the event type and status code
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

          // Store the service status after it's no longer "deploying"
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
