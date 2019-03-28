'use strict';

function routeCollection() {

    this.routes = {};
    this.index = 0;

}

routeCollection.prototype.register = function (object) {

    if (object instanceof route) {
        if (typeof this.routes[object.getMethod()] === "undefined") {
            this.routes[object.getMethod()] = [];
        }
        this.routes[object.getMethod()].push(object);
        this.index++
    }

};

function route(method, pattren, action, params) {

    this.method = method;
    this.pattren = pattren;
    this.action = action;
    this.params = params || {};
    this.dispatched = false;
    this._afterCallback = function () {
    };
    this._beforeCallback = function () {
    };

}

route.prototype.getPattren = function () {
    return this.pattren;
};

route.prototype.getMethod = function () {
    return this.method;
};

route.prototype.getAction = function () {
    return this.action;
};

route.prototype.getAfter = function () {
    return this._afterCallback;
};

route.prototype.getBefore = function () {
    return this._beforeCallback;
};

route.prototype.getParams = function () {
    return this.params;
};

route.prototype.before = function (callback) {
    if (typeof callback !== 'function')
        throw new Error("Invalid callback for " + this.pattren);

    this._beforeCallback = callback;

    return this;
};

route.prototype.after = function (callback) {
    if (typeof callback !== 'function')
        throw new Error("Invalid callback for " + this.pattren);

    this._afterCallback = callback;
};

route.prototype._dispatch = function () {

};


function router(rc) {
    if (rc instanceof routeCollection) {
        this.collection = rc;
    } else {
        throw new Error('Collection must be the instance of routeCollection.');
    }
}


router.prototype.get = function (uri, action, params) {
    return this._add('GET', uri, action, params);
};

router.prototype.post = function (uri, action, params) {
    return this._add('POST', uri, action, params);
};

router.prototype.put = function (uri, action, params) {
    return this._add('POST', uri, action, params);
};

router.prototype.delete = function (uri, action, params) {
    return this._add('POST', uri, action, params);
};

router.prototype.controller = function (uri, controller, params) {
    if (typeof controllers[controller] == 'undefined') {
        throw new Error('Invalid controller ' + controller + '.');
    }

    var o = controllers[controller];
    var _r = this;

    Object.keys(o).forEach(function(key) {
        var m1 = key.substr(0,3); // for get and put
        var m2 = key.substr(0,4); // for post
        var m3 = key.substr(0,6); // for delete


        var method = 'GET';
        var action = key.replace(/get|put|delete|post/, function (matched) {
            method = matched.toUpperCase();
            if (['put', 'delete'].indexOf(matched) >= 0) {
                method = 'POST';
            }
            return '';
        });

        _r._add(method, uri + '/' + action.toLowerCase(), controller + '.' + key, params);

    });

}

router.prototype._add = function (method, uri, action, params) {
    var r = new route(method, uri, action, params);
    this.collection.register(r);
    return r;
};

var c = new routeCollection();

exports.collection = function () {
    return c;
};

exports.builder = function () {
    return new router(c);
}; 