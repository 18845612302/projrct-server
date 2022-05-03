const mongoose = require('mongoose');
const roleSchema=new mongoose.Schema({
name:{type:String,require:true},
auth_name:String,
auth_time:Number,
create_time:{type:Number,default:Date.now},
menus:Array

})
const RoleModel=mongoose.model('roles',roleSchema)
module.exports=RoleModel