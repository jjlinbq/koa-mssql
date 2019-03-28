module.exports = function (req, res) {

    if (req.getHeader('x-token') === null) {
        // send unauthorized
    }

};