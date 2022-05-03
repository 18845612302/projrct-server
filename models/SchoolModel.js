const mongoose = require("mongoose");
const SchoolSchema=new mongoose.Schema({
    schoolname:{
        type:String,required:true
    }
})
const SchoolModel=mongoose.model('schools',SchoolSchema)
module.exports=SchoolModel
