// Function to handle table population
const populateTable = (table, database, apps) => {
  const tableBody = table.querySelector("tbody");
  tableBody.innerHTML = "";

  // Function to create a row
  const createRow = (name, status, type, lastDeployed) => {
    const row = document.createElement("tr");
    row.setAttribute("class", "table-row");
  

    const syncCell = document.createElement("td");
    if (type === "PostgreSQL") {
      const pizza = document.createElement("i");

      pizza.setAttribute("class", "fa-solid fa-robot");
      pizza.style.color = "#ffffff"
      syncCell.append(pizza);
    } else if (type === "Web Service") {
      
      const checkBox = document.createElement("input");
      checkBox.setAttribute("type", "checkbox");
      checkBox.setAttribute("class", "sync-check-input");
      checkBox.setAttribute("name", name);
      checkBox.setAttribute("data-value", name);
      checkBox.addEventListener("click", (e) => {
     e.stopPropagation(); // Prevent the checkbox click from triggering the row click
        console.log("Checkbox clicked!");
        console.log("Is checkbox checked? ", e.target.checked);
      });

      syncCell.append(checkBox);
    }

    const nameCell = document.createElement("td");
    nameCell.setAttribute("scope", "row");
    nameCell.textContent = name;
    addModalListener(nameCell, name, apps, type)

    const statusCell = document.createElement("td");
   statusCell.setAttribute("scope", "row");
   
   const statusSpan = document.createElement("span");
   if (["Available", "Deployed"].includes(status)) {
     statusSpan.setAttribute("class", "badge text-bg-success");
     statusSpan.textContent = status;
    } else {
      statusSpan.setAttribute("class", "badge text-bg-danger");
      statusSpan.textContent = status;
    }
    statusCell.appendChild(statusSpan);
    addModalListener(statusCell, name, apps, type)

    const typeCell = document.createElement("td");
    typeCell.textContent = type;
    addModalListener(typeCell, name, apps, type)


    const lastDeployedCell = document.createElement("td");
    lastDeployedCell.textContent = lastDeployed;
    addModalListener(lastDeployedCell, name, apps, type)


    row.appendChild(syncCell);
    row.appendChild(nameCell);
    row.appendChild(statusCell);
    row.appendChild(typeCell);
    row.appendChild(lastDeployedCell);

    return row;
  };

  const addModalListener = (element, name, apps, type) => {
    element.setAttribute("data-bs-toggle", "modal");
    element.setAttribute("data-bs-target", "#main-modal");
    element.setAttribute("data-name", name);
    element.addEventListener("click", () => {
      const appName = element.getAttribute("data-name");
      openModal(appName, apps, type);
    });
  }

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
  Object.values(apps).forEach((service) => {
    const row = createRow(
      service.name,
      service.status,
      service.type,
      service.lastDeployed
    );
    tableBody.appendChild(row);
  });
};
