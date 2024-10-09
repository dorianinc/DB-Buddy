// Helpers --------------------------------------------------------------------------------------------

const validateVariables = async () => {
  let missing = [];

  if (!databaseName) {
    missing.push("databaseName");
  }
  if (!databaseKey) {
    missing.push("databaseKey");
  }
  if (!region) {
    missing.push("region");
  }
  if (!baseUrl) {
    missing.push("baseUrl");
  }
  if (!key) {
    missing.push("key");
  }

  if (missing.length) {
    console.log(
      `The following variables still don't have a value: ${missing.join(", ")}`
    );
    console.log("Please add them for the script to run");
    return false;
  }
  return true;
};

const handleError = (error, functionName) => {
  const statusCode = error.response?.status;
  const errorMessage =
    error.response?.data?.message || "An unknown error occurred";

  console.error(
    `Error in ${functionName}: ${errorMessage} ${
      !statusCode ? "" : `Status code: ${statusCode}`
    }`
  );

  throw new Error(
    `Error in ${functionName}: ${errorMessage} ${
      !statusCode ? "" : `Status code: ${statusCode}`
    }`
  );
};

const isEmpty = (obj) => {
  return Object.values(obj).length === 0;
};

module.exports = { validateVariables, isEmpty, handleError };
