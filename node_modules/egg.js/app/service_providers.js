// allow cross domain requests
var cors = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
};

module.exports = [
    cors
];