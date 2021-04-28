const express = require("express");
const router = express.Router();
var helper = require('../app/Helpers');
var User = require('../models/users');
var Package = require('../models/package');
var Package_Settings = require('../models/package_settings');
var admin = require("../config/admin");
const e = require("express");


 // middleware check login
function authChecker(req, res, next) {
    if (req.session.username || req.path === '/signin' || req.path === '/auth' || req.path === '/register') {
        next();
    } else {
        res.redirect("/signin");
    }
}

router.use(authChecker);

router.get('/', (req, res) => {
    res.send('Page Not Found!');
});

router.get('/user-manager', (req, res) => {
    if(req.session.username == admin.account) {
        User.find().exec((err, data) => {
            res.render('admin/dashboard', {
                helper: helper,
                worker: false,
                data: data,
                session: req.session
            });
        });        
    }else {
        res.send('Page Not Found!');
    }
});

router.post('/user-manager', (req, res) => {
    if(req.session.username == admin.account) {
        User.findOne({
            UID: req.body.user_id
        }).exec((err, data) => {
            if(!data) {
                res.json({
                    status: false,
                    msg: 'Người dùng này không tồn tại!'
                });
            }else {
                if(data.UID == req.session.UID) {
                    res.json({
                        status: false,
                        msg: 'Permision Error!'
                    });   
                }else {
                    switch(req.body.type) {
                        case 'delete':
                            User.deleteOne({
                                UID: req.body.user_id
                            }).exec();
                            res.json({
                                status: true,
                                msg: 'Xóa người dùng thành công'
                            });           
                        break;
            
                        case 'edit':
                            User.updateOne({
                                UID: req.body.user_id
                            }, { $set: {
                                money: req.body.money
                            }}).exec();
                            res.json({
                                status: true,
                                msg: 'Cập Nhật Thành Công!'
                            });     


                        break;

                        case 'load_info':
                            res.json({
                                status: true,
                                data: data,
                                msg: 'Success'
                            });
                        break;
            
                        default:
                            res.json({
                                status: false,
                                msg: 'Lỗi hệ thống!'
                            });
                        break;
                    }
                }
            }
        });        
    }else {
        res.json({
            status: false,
            msg: 'Permision Error! Vui lòng đăng nhập và thử lại!'
        });
    }
});

module.exports = router;