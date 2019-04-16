
var fn_index = async(ctx,next)=>{
    ctx.response.body=`<form action="/signin" method="post">
        <p>Name: <input name="name" value="koa"></p>
        <p>Password: <input name="password" type="password"></p>
        <p><input type="submit" value="Submit"></p>
    </form>`;
};

var fn_signin = async(ctx,next)=>{
    var name = ctx.request.body.name||'',
    password = ctx.request.body.password||'';
    if(name=='koa'&&password=='123456'){
        ctx.response.body=`<h1>Welcome, ${name}!</h1>`;
    }else{
        ctx.response.body = `<h1>Login failed!</h1>
        <p><a href="/">Try again</a></p>`;
    }
}
var fn_login = async(ctx, next) => {
    var sqlget = require("../sqlconfig/sqlget");
    var sql = require("../mssqlInit/sqldb");
    var Async = require('async');
    var res = await new Promise((resolve, reject)=>{
        Async.waterfall([
            function(callback){
                sqlget("CommonSql.Role.OrgExistsRoleInUser",(sqls)=>{
                    callback(null,sqls)
                });   
            },
            function(sqls,callback){
                sql.connectDB("Portal",()=>{
                    callback(null,sqls)
                });
            },
            function(sqls,callback){
                sql.querySql(sqls,{"LoginId":"zengjh"},(err,result)=>{
                   // console.dir(result.recordset);
                    resolve(result);
                });
            }
        ]);
    }); 
    await ctx.render('index', {
        name: 'Welcome',
        content:res.recordset
    }); 
}
module.exports = {
    'GET /': fn_index,
    'POST /signin': fn_signin,
    'GET /index':fn_login
};