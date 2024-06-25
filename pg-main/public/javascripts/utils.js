// Options: 'debug', 'demo', 'release'
const CLIENT_MODE = 'demo'

function truncate(str, max_length, end) {
    if (str.length <= max_length) {
        return str;
    } else if (end) {
        return str.substr(0, max_length-end.length) + end;
    } else {
        return str.substr(0, max_length);
    }
}

function sanitize(str, max_length) {
    return DOMPurify.sanitize(truncate(str, max_length));
}

function clientError(str) {
    if (CLIENT_MODE == 'debug') {
        console.error(str);
    }
}
function clientLog(str) {
    if (CLIENT_MODE == 'debug') {
        console.log(str);
    }
}