// setup db
var knex = require('knex')({
    client: process.env.DB_DRIVER,
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        charset: process.env.DB_CHARSET
    }
});

// mysql orm
var bookshelf = require('bookshelf')(knex);


var models = {};

// load models
require("fs").readdirSync(__dirname).forEach(function (file) {

    if (file != 'index.js') {
        models[file.replace('.js', '')] = require(__dirname + '/' + file)(bookshelf);
    }

});

module.exports = models;