'use strict';
var fs = require("fs");

function log() {

    this.path_info = process._basePath + "/storage/logs/access_logs.log";
    this.path_error = process._basePath + "/storage/logs/error_logs.log";

}

log.prototype.info = function (message) {
    console.log(message);
    this.write('info', message)
};

log.prototype.error = function (message) {
    this.write('error', message)
};

log.prototype.debug = function (message) {
    this.write('debug', message)
};

log.prototype.write = function (type, message) {

    var file = this.path_info;
    var log_to_console = true;

    switch (type) {
        case 'error':
            file = this.path_error;
            type = 'error';
            break;
        case 'debug':
            file = this.path_info;
            log_to_console = true;
            break;

        default:

            log_to_console = true;
            break;

    }

    var standrad_message = "[" + date.format("Y-m-d H:i:s") + "] [" + type + "]: " + message + "\r\n";

    fs.appendFile(file, standrad_message, function (err) {

        if (err) {
            console.log("Unable to write log.");
            console.log(err.stack);

        }

    });

    if (log_to_console == true) {

        switch (type) {
            case 'error':
                console.error(standrad_message);
                break;
            default:
                console.log(standrad_message);
                break;
        }

    }

};

module.exports = new log;