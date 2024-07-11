// Log a message to console if in debug mode.
// @param msg The message to report
function appLog(msg) {
  if (process.env.APP_MODE == 'debug') {
    console.log("[DEBUG]", msg);
  }
}

// Report an error to console if in debug mode.
// @param error The error message to report
function appError(error) {
  if (process.env.APP_MODE == 'debug') {
    console.error(error);
  }
}

// Surround a function call in a try/catch and report an error on catch in debug mode.
async function appTry(try_func) {
  try {
    await try_func();
  } catch (error) {
    if (error?.errors) {
      appError(error.errors);
    } else {
      appError(error);
    }
  }
}

export { appLog, appError, appTry };