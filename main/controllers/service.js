const axios = require("axios");
const options = require("./configs");
const { isEmpty } = require("./helpers");
const { formatDistanceToNow } = require("date-fns");
const { store } = require("../store");

const baseUrl = "https://api.render.com/v1";

// Service --------------------------------------------------------------------------------------------

const fetchServices = async (refresh) => {
  try {
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
    return services;
  } catch (error) {
    console.error("error in fetchServices: ", error);
    throw error
  }
};

const checkServiceStatus = async (services) => {
  console.log("CHECKING SERVICE STATUS")
  try {
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
              `${baseUrl}/services/${service.id}/events?limit=10`,
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
          console.error(`Error checking service ${service.name}:`, error);
          store.set(`services.${service.name}.status`, "error");
        }
      })
    );
  } catch (error) {
    console.error("Error during background service checks:", error);
    throw error;
  }
};

module.exports = {
  fetchServices,
  checkServiceStatus,
};
