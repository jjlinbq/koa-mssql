var sqlParaGet = (sqlname,callBack)=>{
    var fs = require("fs");
    var xml2js = require('xml2js');
    var redis = require('../node-redis/redis');
    redis.getString(sqlname,(ret)=>{
        if(ret.status==1){
            callBack(ret.msg);
        }else{
            var parser = new xml2js.Parser();
            var files = fs.readdirSync(__dirname);
            var xml_files = files.filter((f)=>{
                return f.endsWith('.xml');
            });
            for (var f of xml_files){
                fs.readFile(__dirname+"/"+f,(err, result)=>{
                    parser.parseString(result,(e,res)=>{
                        var sqlpa =  res.commands.command;
                        for (const key in sqlpa) {
                           if(sqlpa[key]['$']['key']==sqlname){
                               redis.setString(sqlname,sqlpa[key]['_'],24*60*60,(ret)=>{
                                    callBack(sqlpa[key]['_']);
                               }); 
                           }
                        }
                    })
                });
            }
        }
    });

}
module.exports = sqlParaGet;