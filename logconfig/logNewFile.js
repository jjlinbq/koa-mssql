const fs = require('fs');
var newlogfile =function() {
    var sd = require('silly-datetime');
    var time=sd.format(new Date(), 'YYYY-MM-DD');
    var logpath = __dirname+'/../logs/'+time+'/';
    if(!fs.existsSync(logpath)){
        fs.mkdirSync(logpath);
    }
};
module.exports = newlogfile;
