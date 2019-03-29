/*
* 下面有些命令的开头是z 或者h 或者s的
* z表示有序列表的数据类型
* h表示hash的数据类型
* s表示set集合的数据类型
* l表示list列表的数据类型
*
* */

const redis = require("redis");
    var redisconfig={
        no_ready_check: true,
        host : '127.0.0.1',
        password:'123456',
        port : 6379,
};
  var  client = redis.createClient(redisconfig);

let setString = async(strkey,strvalue,expiretime,callBack)=>{
    client.set(strkey, strvalue, function(err, res) {
            if(err){
                callBack({"status":0,"msg":'set key failed!see error:'+err});
            }else{
                callBack({"status":1,"msg":res});
            }
        });
    client.expire(strkey, expiretime);  //  缓存30天 设置失效时间，秒级
}
let getString = async(strkey,callBack)=>{
    client.get(strkey, function(err, reply) {
        if(err) {
            callBack({"status":0,"msg":'get key '+strkey+' falied!more details,see error:'+err});
        }
        if(reply)
            callBack({"status":1,"msg":reply});
        else
            callBack({"status":0,"msg":'get key failed,properly key is not exist or expired'});
        });
}
let removekey = async(strkey,callBack)=>{
    client.del(strkey,function(err, res) {
            if(err){
                callBack({"status":0,"msg":err});
            }else{
                callBack({"status":1,"msg":res});
            }
        }); 
}
let judgeExists = async()=>{
    client.exists(strkey,function(err, res) {
        if(res === 1){
            callBack({"status":1,"msg":'key exist'});
        }else{
            callBack({"status":0,"msg":'key not exist'});
        }
    }); 
}
module.exports = {
    setString,getString,removekey,judgeExists
}