'use strict';

var fs = require('fs');

var ejs = require('ejs');

var path = require('path');


function view(layout, data) {

    this._layout = layout;
    this._partials = {};
    this._data = data || {};
    this._path = process._basePath + '/views';
}

view.prototype.set = function (key, view) {
    this._partials[key] = view;
};

view.prototype.render = function (func) {

    var _view = this;

    async.forEachOf(_view._partials, function (i, key, callback) {


        var i = i.replace('.', '//');

        ejs.renderFile(path.resolve(_view._path.rtrim('/'), i + ".html"), _view._data, {}, function (err, str) {

            if (err) {
                log.error(err.stack);
            }
            // str => Rendered HTML string
            _view._data[key] = str;

            callback();

        });


    }, function done() {


        ejs.renderFile(_view._path.rtrim('/') + '/' + _view._layout.ltrim("/") + ".html", _view._data, {}, function (err, str) {
            // send rendered html content
            func(str);

        });

    });

};

function response(response) {
    this._response = response;
    this._view = null;
    this._headers = {};
    this._statusCode = 200;

    this.enableCookies = true;
}

response.prototype.view = function (layout, data) {

    this.header("Content-Type", "text/html");

    this._view = new view(layout, data);

    return this._view;

}

response.prototype.render = function (v) {

    var instance = this;

    if (!v instanceof view)
        throw new Error("Invalid view in render response");

    var _response = this._response;

    v.render(function (str) {
        instance._processHeaders();
        _response.end(str, 'utf-8')
    });

}

response.prototype.header = function (key, value) {
    this._headers[key] = value;
}

response.prototype.removeHeader = function (key) {
    if (typeof this._headers[key] != 'undefined') {
        delete this._headers[key];
    }

     this._response.removeHeader(key);
}

response.prototype.status = function (c, m) {
    this._response.statusCode = c;
    this._response.statusMessage = m;
}

response.prototype.html = function (html) {
    this.header('Content-Type', 'text/html');
    this._processHeaders();
    this._response.end(html, 'utf-8');
}

response.prototype.write = function (what, enc) {
    this.header('Content-Type', 'text/plain');
    this._processHeaders();
    this._response.end(what, enc || 'utf-8');
}

response.prototype.json = function (data) {
    this.header("Content-Type", "application/json");
    this.removeHeader('set-cookie');
    this._processHeaders();
    this._response.end(JSON.stringify(data), 'utf-8');
}

response.prototype.notFound = function (c) {
    var v = new view('404', {message: c || 'Page not found!'});
    v._path = process._basePath + '/templates/response';
    this._statusCode = 404;
    this.render(v);
}

response.prototype.serverError = function (c) {
    var v = new view('503', {message: c || ''});
    v._path = process._basePath + '/templates/response';
    this._statusCode = 503;
    this.render(v);
}

response.prototype.end = function (c, e) {
    this._response.end(c, e);
}

response.prototype.abort = function (code, c) {
    var code = code || '404';
    var v = new view(code, {message: c || 'Page not found!'});
    v._path = process._basePath + '/templates/response';
    this._statusCode = code;
    this.render(v);
}

response.prototype._processHeaders = function (status) {

    var status = status || this._statusCode;
    this._response.writeHead(status, this._headers);

}

response.prototype.redirect = function (to) {
    this._statusCode = 302;
    this._processHeaders(302);
    this._response.end();
}

exports.response = function (config) {
    return new response(config);
}
