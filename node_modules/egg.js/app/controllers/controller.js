var controllers = {};

// load models
require("fs").readdirSync(process._basePath + '/app/controllers').forEach(function (file) {


    if (file != 'controller.js') {
        controllers[file.replace('.js', '')] = require(process._basePath + '/app/controllers/' + file);
    }

});

module.exports = controllers;