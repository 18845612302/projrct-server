const multer=require('multer')
const path=require('path')
const fs=require('fs')
const dirPath=path.join(__dirname,'..','public/upload')
const storage=multer.diskStorage({
    //destination:'upload'//string类型是,服务启动回自动创建文件夹
    //函数需要手动创建文件夹
destination:function(req,file,cb){
if(!fs.existsSync(dirPath))
{
    fs.mkdir(dirPath,function(err){
        if(err)
        {
            console.log(err);
        }else{
            cb(null,dirPath)
        }
    })
  
}
else{
    cb(null,dirPath)
}
},
filename:function(req,file,cb)
{
var ext=path.extname(file.originalname);
cb(null,file.fieldname+'-'+Date.now()+ext)
}

})


const upload=multer({storage})
const uploadSingle=upload.single('image')
module.exports=function fileUpload(router)
{
    router.post('/manage/img/upload',(req,res)=>{
        uploadSingle(req,res,function(err){
            if(err)
            {
                return res.send({
                    status:1,
                    msg:'上传文件失败'
                })
            }
            var file=req.file
            res.send({
                status:0,
                data:{
                    name:file.filename,
                    url:'http://localhost:3000/upload/'+file.filename
                }
            })
        })
    })
    router.post('/manage/img/delete',(req,res)=>{
        const {name}=req.body;
        fs.unlink(path.join(dirPath,name),(err)=>{
            if(err)
            {
                res.send({
                    status:1,
                    msg:'删除文件失败'
                })
            }
            else{
                res.send({
                    status:0
                })
            }
        })
    })
}