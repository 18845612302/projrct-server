const mongoose = require('mongoose');
const studentSchema=new mongoose.Schema({
name:{type:String,required:true},
gender:{type:String,required:true},
school:String,
major:String,
grade:String,
education:String,
direction:{type:String,required:true},
id_number:String,
phone:{type:String,required:true},
parent:String,
address:String,
qq:String,
class:{type:String,required:true},
admission_date:String,//入学时间
teacher_id:{type:String,required:true},
manager_id:{type:String,required:true},
pictures:Array,//照片列表
note:String//备注
})
const StudentModel=mongoose.model('students',studentSchema);
module.exports=StudentModel;