/* 
启动模块
1.通过express启动服务
2.通过mongoose连接mongodb数据库（需要连接数据库上之后再连启动服务）
3.使用中间件
*/
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const app=express();
//声明使用静态中间件
app.use(express.static('public'));
//声明使用解析post请求的中间件
app.use(express.urlencoded({extended:true}))
//请求参数时：name-tom*pwd-123
//请求体参数时json结构：{name：tom，pwd：123}
app.use(express.json())
app.use('./node_modules',express.static(path.join(__dirname,'./node_modules')));
//使用路由中间件
const indexRouter=require('./routers');
app.use('/',indexRouter)
mongoose.connect('mongodb://localhost/b0345',{useNewUrlParser:true})
.then(()=>{
    console.log("连接数据库");
    app.listen('3000',()=>{
        console.log('服务器启动成功');
    })
}).catch(err=>{
    console.log('失败',err);
})