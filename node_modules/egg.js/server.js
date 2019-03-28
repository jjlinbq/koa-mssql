process._basePath = __dirname;

// load env file
require('dotenv').config();

// include egg module
var egg = require('egg-framework');

// http is required to create server
var http = require('http');

// load web routes
var web = require(process._basePath + '/routes/web');

// load api routes
var api = require(process._basePath + '/routes/api');

// create application
var app = egg.create(http);

// pass router to web routes
web._init(app.router());
api._init(app.router());

// create server and pass instance of egg created application.
http.createServer(app.handle()).listen(process.env.PORT);