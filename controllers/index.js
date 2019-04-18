
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
    var sql = require("../mssqlInit/sqldb");
    var res = await sql.connectDB("Portal");
    if(res.status==1){
        var result =await sql.querySql("CommonSql.Role.OrgExistsRoleInUser",{"LoginId":"zengjh"});
        await ctx.render('index', {
            name: 'Welcome',
            content:result.recordset
        }); 
    }
}
module.exports = {
    'GET /': fn_index,
    'POST /signin': fn_signin,
    'GET /index':fn_login
};