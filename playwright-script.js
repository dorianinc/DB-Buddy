const { chromium } = require("playwright");

const createNewDB = async () => {
  let browser;
  try {
    // Launch browser and open a new page
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to the website
    await page.goto("https://dashboard.render.com/");
    await login(page);

    const services = await getServices(page);
    //   const daysSince = services.database.lastDeployed.split(" ").shift();
    const daysSince = 31;

    if (daysSince >= 30) {
      console.log("Your Database has expired");
      const deleteDB = await deleteOldDatabase(page, services.database);
      if (deleteDB.success) {
        const newDB = await createNewDatabase(page);
        if (newDB.success) {
          await page.goto("https://dashboard.render.com/");
          await updateApps(page, {
            apps: services.apps,
            databaseUrl: newDB.url,
          });
        } else {
          console.error("Failed to create a new database");
        }
      } else {
        console.error("Failed to delete the old database");
      }
    } else {
      console.log("Your Database is still active");
    }
  } catch (error) {
    console.log("❗❗ Error => ", error.message);
    console.error("An error occurred in createNewDB: ", error.message);
  } finally {
    // Always ensure the browser is closed
    if (browser) await browser.close();
  }
};

const login = async (page) => {
  try {
    // Click the "Github" button
    await page.getByRole("button", { name: "Github" }).click();

    // Log in (if necessary)
    await page.getByLabel("Username or email address").fill("dorianinc");
    await page.waitForTimeout(1000);
    await page.getByLabel("Password").fill("Drm#0540095");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForTimeout(1000);
  } catch (error) {
    console.error("Login failed: ", error.message);
    throw error; // Re-throw the error to let the parent function handle it
  }
};

const getServices = async (page) => {
  try {
    // Collect data from the table
    const rows = page.locator("tr");
    await page.waitForTimeout(2000);

    const services = [];
    let database;
    const baseURL = "https://dashboard.render.com";

    // Loop through each row and gather service info
    for (let i = 1; i < (await rows.count()); i++) {
      const obj = {};
      const row = rows.nth(i);
      const columns = row.locator("td");

      const serviceInfo = row.locator("a").nth(0);
      const href = await serviceInfo.getAttribute("href");
      const name = await serviceInfo.innerText();

      for (let i = 0; i < (await columns.count()); i++) {
        obj.name = name;
        obj.url = baseURL + href;
        obj.type = await columns.nth(1).innerText();
        obj.lastDeployed = await columns.nth(4).innerText();
      }

      if (!href.startsWith("/d")) {
        services.push(obj);
      } else {
        database = obj;
      }
    }

    return { database, apps: services };
  } catch (error) {
    console.error("Failed to retrieve services: ", error.message);
    throw error;
  }
};

const createNewDatabase = async (page) => {
  console.log("Creating new database...");
  const response = {};

  try {
    await page.getByRole("button", { name: "new" }).click();
    await page.goto("https://dashboard.render.com/new/database");
    await page.getByPlaceholder("example-postgresql-name").fill("test-db-1");
    await page.getByText("Free", { exact: true }).click();
    await page.getByRole("button", { name: "Create Database" }).click();

    let counter = 0;
    let isAvailable = await waitForElement(page);

    while (isAvailable.message !== "Available" && counter <= 6) {
      isAvailable = await waitForElement(page);
      counter++;
    }

    if (isAvailable.message === "Available") {
      console.log("Your Database is ready!");
    }

    await page.getByRole("button", { name: "Show secret" }).nth(1).click();
    await page.waitForTimeout(1000);

    const databaseURL = await page
      .locator("#internal-database-url")
      .getAttribute("value");

    if (databaseURL) {
      response.success = true;
      response.url = databaseURL;
    } else {
      response.success = false;
      response.url = null;
    }
  } catch (error) {
    console.error("Failed to create a new database: ", error.message);
    response.success = false;
  }

  return response;
};

const deleteOldDatabase = async (page, db) => {
  console.log("Deleting old database...");
  const response = {};

  try {
    await page.goto(db.url);
    await page.getByText("Delete Database").click();
    await page
      .getByLabel("Sudo Command")
      .fill(`sudo delete database ${db.name}`);
    await page.getByRole("button", { name: "Delete Database" }).nth(1).click();

    response.success = true;
    response.message = "Database successfully deleted!";
  } catch (error) {
    console.error("Failed to delete the old database: ", error.message);
    response.success = false;
  }

  return response;
};

const updateApps = async (page, data) => {
  try {
    for (let i = 0; i < data.apps.length; i++) {
      const app = data.apps[i];
      await page.goto(`${app.url}/env`);

      const variablesContainer = page.locator("#environment-variables");
      const variables = variablesContainer.locator(".items-start");
      await page.waitForTimeout(2000);
      const variablesCount = await variables.count();
      console.log("🖥️  variablesCount: ", variablesCount);
    }

    // Logic to update apps (not implemented)
  } catch (error) {
    console.error("Failed to update apps: ", error.message);
  }
};

const waitForElement = async (page) => {
  const response = {};
  try {
    console.log("Waiting for element...");
    await page.waitForTimeout(10000);
    const message = await page
      .locator(".status-success-background")
      .innerText();

    if (message) {
      response.success = true;
      response.message = message;
    } else {
      response.success = false;
      response.message = null;
    }
  } catch (error) {
    console.error("Failed while waiting for element: ", error.message);
    response.success = false;
    response.message = null;
  }
  return response;
};

module.exports = { createNewDB };
