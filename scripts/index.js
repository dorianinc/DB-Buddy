document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

const initializeApp = async () => {
  const spinner = document.querySelector(".spinner-container");
  const table = document.getElementById("servicesTable");

  // Show spinner and hide table initially
  table.style.display = "none";

  try {
    // Fetch services
    const services = await window.api.getServices();
    const database = services.database;
    const apps = services.apps;

    // Populate the table with services data
    populateTable(table, database, apps);
  } catch (error) {
    console.error("Error fetching services:", error);
  } finally {
    // Hide spinner and show table
    spinner.style.display = "none";
    table.style.display = "table";
  }
};
