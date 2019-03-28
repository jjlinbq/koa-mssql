var models = require(process._basePath + '/models');

var path = require('path');
var fs = require('fs');


module.exports._init = function (router, User) {

    router.get('/', function (req, res) {

        var v = res.view('layouts\\main', {title: 'Login'});
        v.set('_pageBody', 'guest.login');
        return res.render(v);
    });

    //router.controller('/help', 'help');

    router.post('/auth/login', 'auth.login');

    router.get('/assets/(.*)', function (req, res) {

        var filePath = './' + req.uri().ltrim('/');

        var ext = path.extname(req.uri());

        var contentType = 'text/plain';

        switch (ext) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.html':
                contentType = 'text/html';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpg';
                break;
        }

        fs.readFile(filePath, function(err, content) {
            if (err) {
                req.notFound();
            } else {
                res.header('Content-Type', contentType);
                res.end(content, 'utf-8');
            }


        });

    });

    router.get('/users', function (request, res) {

        log.debug("You are at api users page");
        //res.write("egg framework (btea) \r\nBY: Harcharan Singh <artisangang@gmail.com>");


        models.User.fetchAll().then(function (users) {

            var v = res.view('layouts\\main', {title: 'About', users: users});
            v.set('_pageBody', 'users');
            return res.render(v);

        });


    }, {roles: ['admin', 'manager'], middlewares: ['auth:*']}).before(function () {

        log.debug("This is api users before callback");

    }).after(function () {

        log.debug("This is api users after callback");
    });


}


