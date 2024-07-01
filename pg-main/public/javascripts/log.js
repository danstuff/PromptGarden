const APP_MODE = 'debug'

function appError(str) {
    if (APP_MODE == 'debug') {
        console.error(str);
    }
}
function appLog(str) {
    if (APP_MODE == 'debug') {
        console.log(str);
    }
}

function appIsDemo() {
    return APP_MODE == 'demo';
}

export { appError, appLog, appIsDemo };