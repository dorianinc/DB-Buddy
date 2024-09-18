document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  console.log("App is ready");
});

async function initializeApp() {
  const spinner = document.querySelector(".spinner-container");
  const table = document.getElementById("servicesTable");
  const tableBody = table.querySelector("tbody");

  // Show spinner and hide table initially
  table.style.display = "none";

  try {
    // Fetch services
    const services = await window.api.getServices();
    const database = services.database;
    const apps = Object.values(services.apps);

    console.log("🖥️  database: ", database);
    console.log("🖥️  apps: ", apps);

    // Function to create a row
    const createRow = (name, status, type, lastDeployed) => {
      const row = document.createElement("tr");

      const nameCell = document.createElement("th");
      nameCell.setAttribute("scope", "row");
      nameCell.textContent = name;

      const statusCell = document.createElement("td");
      const statusSpan = document.createElement("span");
      if (["Available", "Deployed"].includes(status)) {
        statusSpan.setAttribute("class", "badge text-bg-success");
        statusSpan.textContent = status;
      } else {
        statusSpan.setAttribute("class", "badge text-bg-danger");
        statusSpan.textContent = status;
      }
      statusCell.appendChild(statusSpan);

      const typeCell = document.createElement("td");
      typeCell.textContent = type;

      const lastDeployedCell = document.createElement("td");
      lastDeployedCell.textContent = lastDeployed;

      row.appendChild(nameCell);
      row.appendChild(statusCell);
      row.appendChild(typeCell);
      row.appendChild(lastDeployedCell);

      return row;
    };

    // Add a row for the database service if it exists
    if (database) {
      const dbRow = createRow(
        database.name,
        database.status,
        database.type,
        database.lastDeployed
      );
      tableBody.appendChild(dbRow);
    }

    // Add rows for each app service
    apps.forEach((service) => {
      const row = createRow(
        service.name,
        service.status,
        service.type,
        service.lastDeployed
      );
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching services:", error);
  } finally {
    // Hide spinner and show table
    spinner.style.display = "none";
    table.style.display = "table";
  }
}
