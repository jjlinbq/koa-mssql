/**
 *sqlserver Model
 **/
const mssql = require("mssql");
const conf = require("./sqlconfig.json");
const loggers = require("../logconfig/logger");
const sqlget = require("../sqlconfig/sqlget");
let con = null;
let restoreDefaults = function () {
    conf;
};
let connectDB = async(dbname) => {
    con = new mssql.ConnectionPool(conf[dbname]);
    return await new Promise((resolve,reject)=>{
        con.on('error', err => {
            if (err) {
                loggers.logerror('sql connect on error!',JSON.stringify(err));
                reject(err);
            }
        });
        con.connect(err => {
            if (err) {
                loggers.logerror('sql connect error!',JSON.stringify(err));
                reject(err);
            }else{
                resolve({"status":1});
            }
        });
    });
}
let filterSql = (sql,index)=>{
    var regstr = "{\?(.*?)@"+index+"(.*?)}";
    var reg =  new RegExp(regstr);
    var matchsql = sql.match(reg)[0];
    var alrtsql = matchsql.replace('{?','').replace('}','');
    return sql.replace(matchsql,alrtsql);
}
let querySql = async(sqlname, params)=> {
    try{
        if(con==null){
            await connectDB("OA");//默认连接oa
        }
        let ps = new mssql.PreparedStatement(con);
        return await new Promise((resolve,reject)=>{
            var ASync = require("async");
            ASync.waterfall([
                (callback)=>{
                    sqlget(sqlname,(sql)=>{
                        if (params != ""&&params!=null&&params.length!=0) {
                            for (var index in params) {
                                sql = filterSql(sql,index);
                                if (typeof params[index] == "number") {
                                    ps.input(index, mssql.Int);
                                } else if (typeof params[index] == "string") {
                                    ps.input(index, mssql.NVarChar);
                                }
                            }
                        }
                        sql = sql.replace(/{\?(.*?)}/g,'');
                        callback(null,sql,params);
                    });
                },
                (sql,params,callback)=>{
                    ps.prepare(sql, err => {
                        if (err)
                            reject(err);
                        callback(null,params);
                    });
                },(params,callback)=>{
                    ps.execute(params, (err, recordset) => {
                        if(err)
                            reject(err);
                        resolve(recordset);
                    });
                }
            ]);
        });

    }catch(err){
        loggers.logerror('sql error!',JSON.stringify(err));
        console.error('SQL error', err);
    }
    restoreDefaults();
};


var select = async (tableName, field, params, orderfield, callBack) =>{
    try{
        var ps =await new mssql.PreparedStatement(con);
        var sql = "select * from " + tableName + " ";
        if (field != ""&&field != null) {
            sql = "select ";
            for(var item in field){
                sql+=field[item]+",";
            }
            sql = sql.substring(0,sql.length-1);
            sql +=" from "  + tableName + " ";
        }
        if (params != null&&params.length!=0) {
            sql +="where ";
            for (var index in params) {
                if (typeof params[index] == "number") {
                    ps.input(index, mssql.Int);
                    sql += index.toString()+'=@'+index.toString()+" and ";
                } else if (typeof params[index] == "string") {
                    ps.input(index, mssql.NVarChar);
                    sql += index.toString()+'=@'+index.toString()+" and ";
                }
            }
        }
        sql = sql.substring(0,sql.length-4);
        if(orderfield!=null&&orderfield.length!=0){
            sql+="order by ";
            for (const key in orderfield) {
                sql+=key+",";
            }
        }
        sql = sql.substring(0,sql.length-1);
        console.log(sql);
        ps.prepare(sql, err => {
            if (err)
                console.log(err);
            ps.execute(params, (err, recordset) => {
                callBack(err, recordset);
                ps.unprepare(err => {
                    if (err)
                        console.log(err);
                });
            });
        });
    }catch(err){
        loggers.logerror('sql error!',JSON.stringify(err));
        console.error('SQL error', err);
    }
    restoreDefaults();
};

var selectAll = async (tableName, callBack)=> {
    try{
        var ps = new mssql.PreparedStatement(con);
        var sql = "select * from " + tableName + " ";
        ps.prepare(sql, err => {
            if (err)
                console.log(err);
            ps.execute("", (err, recordset) => {
                callBack(err, recordset);
                ps.unprepare(err => {
                    if (err)
                        console.log(err);
                });
            });
        });
    }catch(err){
        loggers.logerror('sql error!',JSON.stringify(err));
        console.error('SQL error', err);
    }
    restoreDefaults();
};

var add = async (addObj, tableName, callBack)=> {
    try{
        var ps = new mssql.PreparedStatement(con);
        var sql = "insert into " + tableName + "(";
        if (addObj != ""&&addObj != null&&addObj.length != 0) {
            for (var index in addObj) {
                if (typeof addObj[index] == "number") {
                    ps.input(index, mssql.Int);
                } else if (typeof addObj[index] == "string") {
                    ps.input(index, mssql.NVarChar);
                }
                sql += index + ",";
            }
            sql = sql.substring(0, sql.length - 1) + ") values(";
            for (var index in addObj) {
                if (typeof addObj[index] == "number") {
                    sql += addObj[index] + ",";
                } else if (typeof addObj[index] == "string") {
                    sql += "'" + addObj[index] + "'" + ",";
                }
            }
        }
        sql = sql.substring(0, sql.length - 1) + ")";
        ps.prepare(sql, err => {
            if (err)
                console.log(err);
            ps.execute(addObj, (err, recordset) => {
                callBack(err, recordset);
                ps.unprepare(err => {
                    if (err)
                        console.log(err);
                });
            });
        });
    }catch(err){
        loggers.logerror('sql error!',JSON.stringify(err));
        console.error('SQL error', err);
    }
    restoreDefaults();
};

var update = async (updateObj, whereObj, tableName, callBack) =>{
    try{
        var ps = new mssql.PreparedStatement(con);
        var sql = "update " + tableName + " set ";
        if (updateObj != "") {
            for (var index in updateObj) {
                if (typeof updateObj[index] == "number") {
                    ps.input(index, mssql.Int);
                    sql += index + "=" + updateObj[index] + ",";
                } else if (typeof updateObj[index] == "string") {
                    ps.input(index, mssql.NVarChar);
                    sql += index + "=" + "'" + updateObj[index] + "'" + ",";
                }
            }
        }
        sql = sql.substring(0, sql.length - 1) + " where ";
        if (whereObj != "") {
            for (var index in whereObj) {
                if (typeof whereObj[index] == "number") {
                    ps.input(index, mssql.Int);
                    sql += index + "=" + whereObj[index] + " and ";
                } else if (typeof whereObj[index] == "string") {
                    ps.input(index, mssql.NVarChar);
                    sql += index + "=" + "'" + whereObj[index] + "'" + " and ";
                }
            }
        }
        sql = sql.substring(0, sql.length - 5);
        ps.prepare(sql, err => {
            if (err)
                console.log(err);
            ps.execute(updateObj, (err, recordset) => {
                callBack(err, recordset);
                ps.unprepare(err => {
                    if (err)
                        console.log(err);
                });
            });
        });
    }catch(err){
        loggers.logerror('sql error!',JSON.stringify(err));
        console.error('SQL error', err);
    }
    restoreDefaults();
};

var del = async (params, tableName, callBack) =>{
    try{
        var ps = new mssql.PreparedStatement(con);
        var sql = "delete from " + tableName + " ";
        if (params != null&&params.length!=0) {
            sql +="where ";
            for (var index in params) {
                if (typeof params[index] == "number") {
                    ps.input(index, mssql.Int);
                    sql += index.toString()+'=@'+index.toString()+" and ";
                } else if (typeof params[index] == "string") {
                    ps.input(index, mssql.NVarChar);
                    sql += index.toString()+'=@'+index.toString()+" and ";
                }
            }
        }
        ps.prepare(sql, err => {
            if (err)
                console.log(err);
            ps.execute(params, (err, recordset) => {
                callBack(err, recordset);
                ps.unprepare(err => {
                    if (err)
                        console.log(err);
                });
            });
        });
    }catch(err){
        loggers.logerror('sql error!',JSON.stringify(err));
        console.error('SQL error', err);
    }
    restoreDefaults();
};
exports.connectDB = connectDB;
exports.del = del;
exports.select = select;
exports.update = update;
exports.querySql = querySql;
exports.selectAll = selectAll;
exports.add = add;