var log4js = require('log4js');
var logNewFile = require('./logNewFile');
var sd = require('silly-datetime');
log4js.configure({
    appenders: {
        ruleConsole: {type: 'console'},
        ruleFile: {
            type: 'dateFile',
            filename: 'logs/'+sd.format(new Date(), 'YYYY-MM-DD')+'/app.log',
         //   pattern: 'app.log',
            maxLogSize: 10 * 1000 * 1000,
            numBackups: 3,
        //    alwaysIncludePattern: true
        }
    },
    categories: {
        default: {appenders: ['ruleConsole', 'ruleFile'], level: 'info'}
    }
});
levels = {
'trace': log4js.levels.TRACE,
'debug': log4js.levels.DEBUG,
'info': log4js.levels.INFO,
'warn': log4js.levels.WARN,
'error': log4js.levels.ERROR,
'fatal': log4js.levels.FATAL
};
var loginfo = function(name,content){
    logNewFile();
    var logger = log4js.getLogger(name);
    logger.level = levels['info'];
    logger.info(content);
}
var logerror = function(name,content){
    logNewFile();
    var logger = log4js.getLogger(name);
    logger.level =levels['error'];
    logger.error(content);
}
var logdebug = function(name,content){
    var logger = log4js.getLogger(name);
    logger.level =levels['debug'];
    logger.debug(content);
}
module.exports =  {
    loginfo,logerror,logdebug
};
