require("dotenv").config();

const axios = require("axios");
const { ipcMain } = require("electron");
const { fetchRenderData } = require("../scripts/fetchRenderData");
const { writeToFile, readFromFile } = require("../utils/helpers");

const serviceIPC = () => {
  const res = {
    success: true,
    message: "",
    error: "",
    payload: null,
  };

  const API_KEY = process.env.RENDER_API_KEY;

  //  Get services from render
  ipcMain.handle("get-service-data", async (_e, refresh = false) => {
    console.log("~~~~ Handling get-service-data ~~~~~");

    const headers = {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    };

    const fetchData = async () => {
      try {
        const response = await axios.get("https://api.render.com/v1/services?limit=20", headers);
        console.log(response.data);
      } catch (error) {
        // Handle error
        console.error(error);
      }
    };

    fetchData();
  });
 
  //  Get single service data from file
  ipcMain.handle("get-single-service-data", async (_e, data) => {
    console.log("~~~~ Handling get-single-service-data ~~~~~");
    try {
      const appName = data.toLowerCase();
      const services = await readFromFile(`${appName}.txt`);
      res.success = true;
      res.message = "Successfully pulled data from Render";
      res.payload = { services };
      return res;
    } catch (error) {
      console.error("Error in get-service-data IPC handler:", error);
      throw error;
    }
  });

  // Save service data to file
  ipcMain.handle("save-service-data", async (_e, data) => {
    console.log("~~~~ Handling save-service-data ~~~~~");
    const appName = data.appName.toLowerCase();
    try {
      await writeToFile(`${appName}.txt`, data.env);
      res.success = true;
      res.message = "Successfully saved variables";
      return res;
    } catch (error) {
      console.error("Error in save-service-data IPC handler:", error);
      res.success = false;
      res.error = error.message;
      return res;
    }
  });
};

module.exports = serviceIPC;
