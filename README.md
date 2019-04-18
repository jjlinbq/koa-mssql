# koa-mssql
koa搭建的mssql框架，sql连接配置在mssqlinit文件夹底下的sqlconfig.json底下，请自行修改配置，sql语句配置文件在sqlconfig文件夹底下，为xml文件，你可以自己增加xml文件，配置更多的sql语句，sql第一次读取会写入redis缓存，以便后续读取。安装nodejs环境，运行命令npm start,浏览器输入http://localhost:3000 即可
