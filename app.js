const koa = require('koa');
const controller = require('./controllers');
const bodyParser = require('koa-bodyparser');
const views = require('koa-views') ,
 logger = require('koa-logger')
, json = require('koa-json')
, onerror = require('koa-onerror');
const path = require('path');
const app = new koa();
const loggers = require('./logconfig/logger');
// log request URL:
onerror(app);
app.use(async (ctx, next) => {
    loggers.loginfo('response',`Process ${ctx.request.method} ${ctx.request.url}...\n`);
    await next();
});
app.use(views('views',{extension:'ejs'}));
app.use(bodyParser());
app.use(json());
app.use(logger());
app.use(controller().routes());
app.listen(3000);

console.log('app started at port 3000...\n');
