const { chromium } = require("playwright");

const getPage = async () => {
    // Launch browser and open a new page
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
  
    // Navigate to the website
    await page.goto("https://dashboard.render.com/");
    return page;
  };
  
  const login = async (page) => {
    // Click the "Github" button
    await page.getByRole("button", { name: "Github" }).click();
  
    // Log in (if necessary)
    await page.getByLabel("Username or email address").fill("dorianinc");
    await page.waitForTimeout(1000);
    await page.getByLabel("Password").fill("Drm#0540095");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForTimeout(1000);
  
    const authButton = page.getByRole("button", {
      name: "Authorize Render",
    });
  
    const isVisible = await authButton.isVisible();
    if (isVisible) {
      await authButton.click();
    }
  };

  module.exports = {
    getPage,
    login
  };