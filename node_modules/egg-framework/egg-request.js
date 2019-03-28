'use strict';

var qs = require('querystring');
var url = require('url');

function request() {
    this.requestData = null;
    this._data = {};
    this._uri = "/";
    this._host = null;
    this._port = null;
    this._params = {};
    this._cookies = {};
}

request.prototype._init = function (request,cb) {

    var instance = this;

    this.requestData = request;

    var requestUrl = url.parse(instance.requestData.url, true);
    instance._uri = requestUrl.pathname;
    instance._host = requestUrl.host;
    instance._port = requestUrl.port;

    if (requestUrl.query) {
        for (var k in requestUrl.query) {

            instance._data[k] = requestUrl.query[k];

        }
    }


    if (this.method() == 'POST') {
        var chunk = '';
        request.on('data', function (data) {
            chunk += data;
        });

        request.on('end', function () {
            var post = qs.parse(chunk);

            if (post) {
                for (var k in post) {
                    instance._data[k] = post[k];
                }
            }

            cb();

        });
    } else {
        cb();
    }


        var rc = request.headers.cookie;



        rc && rc.split(';').forEach(function( cookie ) {

            var parts = cookie.split('=');
            instance._cookies[parts[0].trim()] = decodeURI(parts[1].trim());

        });

};

request.prototype._installParams = function (params) {
    this._params = params;
};

request.prototype.user = function () {
    console.log("user...");
};

request.prototype.session = function () {
    return this.requestData.session;
};

request.prototype.original = function () {
    return this.requestData;
};


request.prototype.uri = function () {
    return this._uri.rtrim("/");

};

request.prototype.host = function () {
    return this._host;
};

request.prototype.port = function () {
    return this._port;
};

request.prototype.get = function (key) {
    if (typeof this._data[key] === 'undefined')
        return null;

    return this._data[key];
};

request.prototype.all = function () {
    return this._data;
};

request.prototype.param = function (which) {
    if (typeof this._params[which] === 'undefined')
        return null;

    return this._params[which];
};

request.prototype.params = function () {
    return this._params;
};

request.prototype.headers = function () {
    return this.requestData.headers;
};

request.prototype.cookies = function () {
    return this._cookies;
};

request.prototype.cookie = function (c) {
    if (typeof this._cookies[c] === 'undefined')
        return null;

    return this._cookies[c];
};

request.prototype.getHeader = function (key) {
    if (typeof this.requestData.headers[key] === 'undefined')
        return null;

    return this.requestData.headers[key];
};


request.prototype.method = function () {
    if (typeof this.requestData !== 'undefined') {
        return this.requestData.method.toUpperCase();
    }

    return "GET";

};


module.exports = function () {
    return new request
};