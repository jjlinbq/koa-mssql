module.exports = {
    login: function (req, res) {
        res.json(req.all());
    }
};