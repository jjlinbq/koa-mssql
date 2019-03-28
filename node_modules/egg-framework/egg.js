'use strict';

var requestComponent = require("./egg-request");
var responseComponent = require("./egg-response");
var sessionModule = require('node-session');
global.log = require('./lib/logger');
global.async = require('async');
global.date = require('./lib/date');
global.models = require(process._basePath + process.env.MODELS);

var serviceProviders = require(process._basePath + process.env.SERVICE_PROVIDER);

var middlewares = {};


// extend string object
String.prototype.ltrim = function (what) {
    return this.replace(new RegExp(what + "+"), "");
}

String.prototype.rtrim = function (what) {
    return this.replace(new RegExp(what + "*$"), "");
}

module.exports.create = function (http) {

    // import controllers into global namespace controllers
    global.controllers = require(process._basePath + '/app/controllers/controller');
    // load middlewares
    require("fs").readdirSync(process._basePath + '/app/middlewares').forEach(function (file) {

        middlewares[file.replace('.js', '')] = require(process._basePath + '/app/middlewares/' + file);

    });

    var _egg_routing = require("./egg-router");

    function application(http) {

        this._router = _egg_routing.builder();
        this.http = http;

    }


    application.prototype.router = function () {
        return this._router;
    };

    application.prototype.__dispatch = function (request, response) {


        // set application instance
        var instance = this;

        // set session module in request
        var session = new sessionModule({secret: process.env.SECRET, files: process._basePath + '/storage/sessions'});


        var _egg_request = requestComponent();


        // main dispatch method
        var dispatchRoute = function (route, _egg_request, response) {

            // get before callback
            var before_callback = route.getBefore();

            // get after callback
            var after_callback = route.getAfter();

            // get current route action
            var action_callback = route.getAction();

            // loop through middlewares
            //if (typeof route.getParams().middlewares != 'undefined') {

                async.each(route.getParams().middlewares, function (m, c) {

                    // split middleware to get params
                    var mArray = m.split(':');

                    var key = mArray[0];
                    var params = [];

                    // check if params avialable
                    if (typeof mArray[1] != 'undefined') {
                        // break params into array
                        params = mArray[1].split(',');
                    }

                    if (typeof middlewares[key] !== 'function') {
                        throw new Error('Invalid middleware ' + key + ' in routes.');
                    }

                    // call middleware
                    middlewares[key](_egg_request, _egg_response, c, params);

                }, function (err) {


                    // handle route after running middlewares

                    // if action is clouser
                    if (typeof action_callback === 'function') {
                        before_callback(_egg_request);
                        action_callback(_egg_request, _egg_response);
                        after_callback(_egg_request);
                    } else if (typeof action_callback === 'string') {
                        // in case action is string

                        var actionArr = action_callback.split('.');

                        if (actionArr.length != 2) {
                            throw new Error('Invalid action ' + action_callback + ' in routes.');
                        }

                        var c = actionArr[0];
                        var a = actionArr[1];

                        if (typeof controllers[c] == 'undefined') {
                            console.log('<-- bad request invalid controller-->');
                            return;
                        }

                        if (typeof controllers[c][a] != 'function') {
                            console.log('<-- bad request invalid action -->');
                            return;
                        }

                        controllers[c][a](_egg_request, _egg_response);

                    } else {
                        console.log('<-- bad request -->');
                    }


                });
            //}


        };


        var findMatchingRoute = function () {

            // get current method routes
            var routes = instance._router.collection.routes[_egg_request.method()];

            var uri = _egg_request.uri();

            var key_indexes = [];

            var key_collections = {};

            var key_collections_with_data = {};

            if (routes.length) {

                var _matched = false;

                for (var r in routes) {
                    var route = routes[r];
                    var r_url = route.getPattren();

                    //console.log("URL: " + uri + " Pattern: " + r_url);

                    if (r_url === uri) {
                        //console.log('Matched in raw.');
                        _matched = true;
                        dispatchRoute(route, _egg_request, response);
                        break;
                    } else {

                        var splited_pattren = r_url.split("/");

                        var splited_uri = uri.split("/");

                        var pattren_with_reg_ex = "/";

                        // extract placeholders from pattren
                        if (splited_pattren.length) {
                            for (var index in splited_pattren) {
                                pattren_with_reg_ex += splited_pattren[index].replace(/\{(.*)\}/, "?(.*)") + "/";

                                var extract_key = splited_pattren[index].match(/^\{(.*)\}/);

                                if (extract_key) {
                                    key_collections[index] = extract_key[1];
                                    key_indexes[index] = index;
                                }
                            }
                        }

                        // get values for placeholders
                        if (splited_uri.length) {

                            for (var index in splited_uri) {
                                if (key_indexes.indexOf(index) > -1) {
                                    key_collections_with_data[key_collections[index]] = splited_uri[index];
                                }
                            }

                        }


                        var pattren_with_reg_ex_fix_double_slash = pattren_with_reg_ex.replace(/(\/\/)/g, "/").rtrim("/");

                        var route_final_reg_ex = new RegExp(pattren_with_reg_ex_fix_double_slash);

                        //console.log("Pattren match format: " + pattren_with_reg_ex_fix_double_slash);

                        //console.log("Match results below");

                        var matched_results = uri.match(route_final_reg_ex);

                        //console.log(matched_results);

                        if (matched_results !== null && matched_results.length > 0 && matched_results[0] == uri) {

                            _egg_request._installParams(key_collections_with_data);

                            //console.log(pattren_with_reg_ex_fix_double_slash);
                            //console.log("Matched in pattren loop");
                            _matched = true;
                            dispatchRoute(route, _egg_request, response);
                            break;
                        }

                    }


                } // loop routes

                if (_matched === false) {
                    log.info(_egg_request.method() + '|' + _egg_request.uri() + ' not found.');
                    _egg_response.notFound();
                }

            } else {
                throw new Error('No routes.');
                // if no routes defined
                _egg_response.notFound();
            }// if has routes

        };

        // send response in response component
        var _egg_response = responseComponent.response(response);

        // start session
        session.startSession(request, _egg_response, function () {
        });


        // set request in request component
        _egg_request._init(request, function () {
            if (!serviceProviders.length) {
                return findMatchingRoute();
            }
            serviceProviders.forEach(function (__s) {
                __s(_egg_request, _egg_response, findMatchingRoute);
            });

        });


        //response.end();

    }

    application.prototype.handle = function (request, response) {

        var app = function (request, response) {
            app.egg.__dispatch(request, response);
        };

        app.egg = this;
        return app;

    };

    application.prototype.serviceProviders = function (func) {

    };

    return new application(http);

};


module.exports.import = function (c) {
    return require('./lib/'+c);
};