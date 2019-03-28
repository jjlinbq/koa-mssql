var sqlParaGet = async(sqlname,callBack)=>{
    var fs = require("fs");
    var xml2js = require('xml2js');
    var parser = new xml2js.Parser();
    var files = fs.readdirSync(__dirname);
    var xml_files = files.filter((f)=>{
        return f.endsWith('.xml');
    });
    for (var f of xml_files){
        await fs.readFile(__dirname+"/"+f,(err, result)=>{
            parser.parseString(result,(e,res)=>{
                var sqlpa =  res.commands.command;
                for (const key in sqlpa) {
                   if(sqlpa[key]['$']['key']==sqlname){
                        callBack(sqlpa[key]['_']);
                   }
                }
            })
        });
    }
}
module.exports = sqlParaGet;