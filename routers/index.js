const express = require('express')
const md5 = require('blueimp-md5')
const UserModel = require('../models/UserModel')
const RoleModel = require('../models/roleModel')
const router = express.Router();
const SchoolModel = require('../models/SchoolModel')
const MajorModel = require('../models/MajorModel.js')
const ClassModel = require('../models/ClassModel.js')
const StudentModel = require('../models/StudentModel.js')
const jwt = require("../node_modules/jsonwebtoken")
//登录
router.post('/login', (req, res) => {
    const {
        username, password
    } = req.body;
    console.log(req.headers.token);
    UserModel.findOne({ username, password: md5(password) })
        .then(user => {
            //登录成功
            let content = { name: username };
            let secretOrPrivateKey = "suiyi";
            let token = jwt.sign(content, secretOrPrivateKey, {
                expiresIn: 60 * 60 * 1
            });
            UserModel.create({ token: token })
            if (user) {
                if (user.role_id) {
                    // RoleModel.findOne({
                    //     _id: user.role_id
                    // }).then(role => {
                    //     user._doc.role = role
                    //     res.send({
                    //         status: 0, data: user
                    //     })
                    // })
                    RoleModel.findOne({
                        _id: user.role_id
                    }).then(role => {
                        user._doc.role = role
                        res.send({
                            status: 0, data: user, token: token
                        })
                    })

                }
                else {
                    console.log(token);
                    console.log("aaa");
                    user._doc.role = { menu: [] }
                    //返回登录成功消息，并包含user
                    res.send({ status: 0, data: user, token: token })
                }
            }
            else {
                //登录失败
                res.send({ status: 1, msg: "账户或者密码错误！" })
            }
        }).catch(err => {
            console.log('登录异常', err);
            res.send({ status: 1, msg: '登录异常，请重新尝试' })
        })
})
router.post("/aaa", (req, res) => {
    console.log("aaa");
    let { token } = req.body
    UserModel.findOne({ token: token }).then(data => {

        if (data.length <= 0) {
            res.send({
                status: 0
            })
        }
        else {
            let secretOrPrivateKey = "suiyi"
            jwt.verify(token, secretOrPrivateKey, function (err, decode) {
                if (err) {
                    res.send({ status: 0 })
                }
                else {
                    res.send({
                        status: 1
                    })
                }
            })
        }

    })



})
//获取角色列表
router.get('/manage/role/list', (req, res) => {
    RoleModel.find().then((roles) => {
        res.send({ status: 0, data: roles })
    }).catch((err) => {
        console.log(err);
        res.send({
            status: 1, msg: '获取角色列表异常'
        })
    })
})
router.post('/manage/role/add', (req, res) => {
    const { name } = req.body;
    RoleModel.create({ name }).then(role => {
        res.send({ status: 0, data: role })
    }).catch(err => {
        console.log(err);
        res.send({
            status: 1, msg: '添加角色异常'
        })
    })
})

//更新角色
router.post("/manage/role/update", (req, res) => {
    const role = req.body
    role.auth_time = Date.now();
    RoleModel.findOneAndUpdate({
        _id: role._id,
    }, role).then(oldRole => {
        res.send({ status: 0 })

    }).catch(err => {
        res.send({ status: 1, msg: '添加角色异常', err })
    })


})

//获取用户列表，不包含admin  ,$ne代表不等于
router.get('/manage/user/all', (req, res) => {
    UserModel.find({
        username: { '$ne': 'admin' }
    }).then(users => {
        res.send({
            status: 0, data: users
        })
    }).catch(err => {
        res.send({
            status: 1, msg: '获取所有用户列表异常', err
        })
    })
})
//获取分页用户列表，$ne代表不等于
router.post('/manage/user/list', (req, res) => {
    let page = req.body.page || 1;
    let size = req.body.size || 5;
    UserModel.find({
        username: { "$ne": 'admin' }
    }).then(users => {
        let count = users.length;
        UserModel.find({
            username: { "$ne": 'admin' }
        }).skip((page - 1) * parseInt(size)).limit(parseInt(size)).exec((err, data) => {
            RoleModel.find().then(roles => {
                res.send({
                    status: 0, data: { total: count, data, roles }
                })
            }).catch(err => {
                res.send({
                    status: 1, msg: "服务器错误"
                })
            })
        })
    })

})
router.post('/manage/user/add', (req, res) => {
    // 读取请求参数数据
    const { username, password } = req.body
    // 处理: 判断用户是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
    // 查询(根据username)
    UserModel.findOne({ username })
        .then(user => {
            // 如果user有值(已存在)
            if (user) {
                // 返回提示错误的信息
                res.send({ status: 1, msg: '此用户已存在' })
                return new Promise(() => {
                })
            } else { // 没值(不存在)
                // 保存
                return UserModel.create({ ...req.body, password: md5(password || 'buka') })
            }
        })
        .then(user => {
            // 返回包含user的json数据
            res.send({ status: 0, data: user })
        })
        .catch(error => {
            console.error('注册异常', error)
            res.send({ status: 1, msg: '添加用户异常, 请重新尝试' })
        })
})
//通过id查找一条用户
router.get('/manage/user/find', (req, res) => {
    const user = req.query
    UserModel.findById({ _id: user._id }).then(data => {
        res.send({
            status: 0, data
        })

    }).catch(err => {
        res.send({
            status: 1, msg: '根据id查找用户异常'
        })
    })

}),
    //更新用户
    router.post('/manage/user/update', (req, res) => {
        const user = req.body;
        UserModel.findByIdAndUpdate({ _id: user._id }, user).then(oldUser => {
            const data = Object.assign(oldUser, user)
            res.send({ status: 0, data })
        }).catch(err => {
            res.send({
                status: 1, msg: '更新异常'
            })
        })

    })
//删除用户
router.post('/manage/user/delete', (req, res) => {
    const { userId } = req.body;
    UserModel.deleteOne({
        _id: userId
    }).then(user => {
        res.send({ status: 0 })
    }).catch(err => {
        res.send({ status: 1, msg: '删除用户异常' })
    })
})
//获取权限列表
router.post('/menus', (req, res) => {

    const { roleId } = req.body
    RoleModel.findOne({
        _id: roleId
    })
        .then(role => {
            res.send({
                status: 0, data: {
                    menu: role.menus
                }
            })
        }).catch(err => {
            res.send({
                status: 1, msg: '获取权限列表异常,请重新尝试'
            })
        })
})
router.post('/manage/school/list', (req, res) => {

    let page = req.body.page || 1
    let size = req.body.size || 5;
    SchoolModel.find().then(schools => {
        let count = schools.length;
        SchoolModel.find().skip((page - 1) * parseInt(size)).limit(parseInt(size)).exec((err, data) => {
            res.send({
                status: 0, data: {
                    total: count, data
                }
            })
        })
    }).catch(err => {
        res.send({
            status: 1, msg: "获取学校列表失败,请重新尝试"
        })
    })
})
router.post('/manage/school/add', (req, res) => {
    const { schoolname } = req.body
    // SchoolModel.find({
    //     schoolname
    // }).then(school=>{
    //     if(school)
    //     {
    //         res.send({
    //             status:1,msg:'学校已存在'
    //         })
    //     }else{
    //         SchoolModel.create({
    //             ...req.body
    //         }).then(school=>{
    //             res.send({
    //                 status:0,data:school
    //             })
    //         }).catch(err=>{
    //             res.send({
    //                 status:1,
    //                 msg:'添加学校异常'
    //             })
    //         })
    //     }
    // }).catch(err=>{
    //     res.send({
    //         status:1,
    //         msg:'添加学校异常'
    //     })
    // })
    SchoolModel.find({
        schoolname
    }).then(school => {
        if (school.length) {
            res.send({
                status: 1, msg: '学校已存在'
            })
            return new Promise(() => { })
        } else {
            return SchoolModel.create({
                ...req.body
            })
        }
    }).then(school => {
        res.send({
            status: 0,
            data: school
        })
    }).catch(err => {
        res.send({
            status: 1, msg: '添加学校异常，请重新尝试'
        })
    })



})
router.get('/manage/school/find', (req, res) => {
    const school = req.query;
    SchoolModel.findById({ _id: school._id }).then(data => {
        res.send({
            status: 0, data
        })
    }).catch(err => {
        res.send({
            status: 1, msg: '根据id查询异常'
        })
    })

})
//更新学校信息
router.post('/manage/school/update', (req, res) => {
    const school = req.body
    console.log("school", school);
    SchoolModel.findOneAndUpdate({ _id: school._id }, school)
        .then(oldSchool => {
            // 将原对象内容复制到新对象中
            const data = Object.assign(oldSchool, school)
            // 返回
            res.send({ status: 0, data })
        })
        .catch(error => {
            console.error('更新学校信息异常', error)
            res.send({ status: 1, msg: '更新学校信息异常, 请重新尝试' })
        })
})
//删除学校
router.post('/manage/school/delete', (req, res) => {
    const { schoolId } = req.body;
    SchoolModel.deleteOne({ _id: schoolId }).then(doc => {
        res.send({ status: 0 })
    }).catch(err => {
        res.send({
            status: 1, msg: '删除学校信息异常请重新尝试'
        })
    })
})
//获取专业列表
router.post('/manage/major/list', (req, res) => {
    let page = req.body.page || 1;
    let size = req.body.size || 5;
    MajorModel.find().then(majors => {
        let count = majors.length;
        MajorModel.find().skip((page - 1) * parseInt(size)).limit(parseInt(size)).exec((err, data) => {
            res.send({
                status: 0,
                data: {
                    total: count,
                    data: data
                }
            })
        })
    }).catch(err => {
        res.send({
            status: 1,
            msg: '获取专业列表异常,请重新尝试'
        })
    })
})
//添加专业
router.post('/manage/major/add', (req, res) => {
    const { name } = req.body;
    MajorModel.findOne({ name }).then(major => {
        if (major) {
            res.send({
                status: 1, msg: "专业已存在"
            })
            return new Promise(() => {

            })
        } else {
            return MajorModel.create({ ...req.body })
        }
    }).then(data => {
        res.send({
            status: 0, data
        })
    }).catch(err => {
        res.send({
            status: 1, msg: "添加专业异常", err
        })
    })
})
router.get('/manage/major/find', (req, res) => {
    const major = req.query;
    MajorModel.findById({ _id: major._id }).then(data => {
        res.send({
            status: 0, data
        })

    }).catch(err => {
        res.send({
            status: 1, msg: '根据ID查询异常'
        })
    })
})

router.post('/manage/major/update', (req, res) => {
    const major = req.body;
    MajorModel.findOneAndUpdate({ _id: major._id }, major).then(oldMajor => {
        const data = Object.assign(oldMajor, major);
        res.send({
            status: 0, data
        })
    }).catch(err => {
        res.send({
            status: 1,
            msg: '更新专业异常'
        })
    })
})
//删除专业
router.post('/manage/major/delete', (req, res) => {
    const { majorId } = req.body
    MajorModel.deleteOne({ _id: majorId }).then(data => {
        res.send({
            status: 0
        })
    }).catch(err => {
        res.send({
            status: 1, msg: '删除专业异常'
        })
    })
})
//获取班级列表
router.post('/manage/class/list', (req, res) => {

    let page = req.body.page || 1;
    let size = req.body.size || 5;
    let searchMap = req.body.searchMap || {}
    let obj = {};
    searchMap.teacher_id ? obj['teacher_id'] = searchMap.teacher_id : obj
    searchMap.manager_id ? obj['manager_id'] = searchMap.manager_id : obj
    ClassModel.find(obj).then(classs => {
        let count = classs.length;
        ClassModel.find(obj).skip((page - 1) * parseInt(size)).limit(parseInt(size))
            .exec((err, data) => {
                res.send({
                    status: 0, data: {
                        total: count, data
                    }
                })
            })

    }).catch(err => {
        res.send({
            status: 1,
            msg: '获取班级列表异常'
        })
    })
})
//添加班级
router.post('/manage/class/add', (req, res) => {
    const { name } = req.body;

    ClassModel.findOne({ name }).then(data => {
        if (data) {
            res.send({
                status: 1,
                msg: '此班级已存在'
            })
            return new Promise(() => { })


        } else {
            return ClassModel.create({
                ...req.body
            })
        }

    }).then(data => {
        res.send({
            status: 0, data
        })
    }).catch(err => {
        res.send({
            status: 1,
            msg: '添加班级异常,请重新尝试'
        })
    })
})
//通过Id查询班级
router.get('/manage/class/find', (req, res) => {
    const c = req.query;
    ClassModel.findById({ _id: c._id }).then(data => {
        res.send({
            status: 0, data
        })
    }).catch(err => {
        res.send({
            status: 1, msg: '根据id查找用户异常',
            err
        })
    })
})
//更新班级
router.post('/manage/class/update', (req, res) => {
    const c = req.body;
    console.log(c);
    ClassModel.findByIdAndUpdate({ _id: c._id }, c).then(oldClass => {
        const data = Object.assign(oldClass, c);
        res.send({
            status: 0, data
        })
    }).catch(err => {
        res.send({
            status: 1, msg: '更新班级异常,请重新尝试'
        })
    })
})
//删除功能
router.post('/mangae/class/delete', (req, res) => {
    const { classId } = req.body;
    ClassModel.deleteOne({ _id: classId }).then(doc => {
        res.send({
            status: 0
        })
    }).catch(err => {
        res.send({
            status: 1,
            msg: '删除班级信息失败'
        })
    })
})
//获取学员列表
router.post('/manage/student/list', (req, res) => {
    let page = req.body.page || 1;
    let size = req.body.size || 5;
    let searchMap = req.body.searchMap;
    let obj = {};
    searchMap.name ? obj["name"] = searchMap.name : obj;
    searchMap.direction ? obj["direction"] = searchMap.direction : obj;
    searchMap.class ? obj["class"] = searchMap.class : obj;
    searchMap.teacher_id ? obj["teacher_id"] = searchMap.teacher_id : obj;
    searchMap.manager_id ? obj["manager_id"] = searchMap.manager_id : obj;
    StudentModel.find(obj).then(students => {
        let count = students.length;
        StudentModel.find(obj).skip((page - 1) * parseInt(size)).limit(parseInt(size))
            .exec((err, data) => {
                res.send({
                    status: 0, data: {
                        total: count,
                        data
                    }
                })
            })
    }).catch(err => {
        res.send({
            status: 1,
            msg: '获取学员列表异常，请重新尝试'
        })

    })
})
//获取全部班级
router.get('/manage/class/all', (req, res) => {
    ClassModel.find().then(data => {
        res.send({
            status: 0, data
        })
    }).catch(err => {
        res.send({
            status: 1,
            msg: '获取全部班级列表异常，请重新尝试'
        })
    })


})
router.get('/manage/school/all', (req, res) => {
    SchoolModel.find().then(schools => {
        res.send({
            status: 0,
            data: schools
        })
    }).catch(err => {
        res.send({
            status: 1,
            err
        })
    })
})
router.get('/manage/major/all', (req, res) => {
    MajorModel.find().then(majors => {
        res.send({
            status: 0, data: majors
        })
    }).catch(err => {
        res.send({
            status: 1,
            err
        })
    })
})
//添加学员
router.post('/manage/student/add', (req, res) => {
    StudentModel.create({ ...req.body }).then(data => {
        res.send({
            status: 0,
            data
        })
    }).catch(err => {
        res.send({
            status: 1,
            msg: '添加学员信息异常,请重新尝试'
        })
    })
})
//通过id查找学员信息
router.get('/manage/student/find', (req, res) => {
    const student = req.query;
    StudentModel.findById({
        _id: student._id
    }).then(response => {
        const data = response
        res.send({
            status: 0, data
        })
    }).catch(err => {
        res.send({
            status: 1,
            msg: '根据id查找学员异常'
        })
    })
})
//跟新学员信息
router.post('/manage/student/update', (req, res) => {
    const student = req.body;
    StudentModel.findOneAndUpdate({ _id: student._id }, student).then(oldStudent => {
        const data = Object.assign(oldStudent, student)
        res.send({
            status: 0,
            data
        })
    }).catch(err => {
        res.send({
            status: 1,
            msg: '跟新异常'
        })
    })
})
//删除学员
router.post('/manager/student/delete', (req, res) => {
    const { studentId } = req.body;
    StudentModel.deleteOne({
        _id: studentId
    }).then(doc => {
        res.send({
            status: 0
        })
    }).catch(err => {
        res.send({
            status: 1,
            msg: '删除异常'
        })
    })
})
//校验密码是否正确;
router.post("/manage/user/pwd", (req, res) => {
    const body = req.body;

    UserModel.findOne({
        _id: body.userId, password: md5(
            body.password
        )
    }).then(user => {
        if (!user) {
            return res.send({
                status: 1,
                msg: '密码不正确'
            })
        }
        return res.send({
            status: 0, data: user
        })
    })
})
//修改密码
router.put('/manage/user/pwd', (req, res) => {
    var id = req.body.userId;
    UserModel.findOne({ _id: id }).then(user => {
        if (!user) {
            return res.send({
                status: 1, msg: '用户密码错误'
            })
        }
        user.password = md5(req.body.password)
        UserModel.findByIdAndUpdate(id, user).then(() => {
            return res.send({
                status: 0,
                msg: '修改密码成功'
            })
        })
    })
})

//查询某一年得学员
router.post('/manage/student/date', (req, res) => {
    let { year } = req.body;
    year = year + '';

    StudentModel.aggregate([{
        //添加字段
        $project: {

            year: { $substr: ["$admission_date", 0, 4] },
            month: {
                $substr: ['$admission_date', 5, 2]
            }
        },

    },

    {
        $match: {
            year
        },

    }, {
        $group: {
            _id: "$month", count: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            _id: 1
        }
    }]).exec((err, data) => {

        return res.send({
            status: 0,
            data
        })
    })
})

require('./file-upload')(router)
module.exports = router