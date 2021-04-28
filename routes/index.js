var admin = require('../config/admin');
const express = require("express");
const router = express.Router();
var helper = require('../app/Helpers');
var User = require('../models/users');
var History = require('../models/history');
var Package = require('../models/package');


// middleware
function authChecker(req, res, next) {
    if (req.session.username || req.path === '/signin' || req.path === '/auth' || req.path === '/register') {
        next();
    } else {
        res.redirect("/signin");
    }
}

// middleware package
function packageChecker(req, res, next) {

    switch(req.path) {
        case '/logic-1':
            var condition = 'go88_logic_1';
        break;
        case '/logic-2':
            var condition = 'go88_logic_2';
        break;
        case '/logic-3':
            var condition = 'go88_logic_3';
        break;
    }

    if (req.session.username) {
        Package.find().
        where('username').equals(req.session.username).
        where('package').equals(condition).
        exec((er, data) => {
            if(data.length <= 0) {
                res.redirect("/package/buy-package");
            }else {
                next(); 
            }
        });
    } else {
        res.redirect("/signin");
    }
}

router.use(authChecker);

router.get('/', (req, res) => {
    History.find().
    where('username').equals(req.session.username).
    where('game').equals('go88').
    exec((er, data) => {
        res.render("dashboard", {
                helper: helper,
                worker: false,
                data: data,
                session: req.session
            });
    });
});

router.get('/logic-1', packageChecker, (req, res) => {

    res.render("logic-1", { // chờ cầu
        worker: true,
        server: process.env.SERVER,
        port: process.env.PORT1,
        script: 'logic1',
        session: req.session
    });
});

router.get('/logic-2', packageChecker, (req, res) => {
    res.render("logic-2", { // 3 chẵn 3 lẻ
        worker: true,
        server: process.env.SERVER,
        port: process.env.PORT2,
        script: 'logic2',
        session: req.session
    });
});

router.get('/logic-3', packageChecker, (req, res) => {
    res.render("logic-3", { // về đâu đặt đấy
        worker: true,
        server: process.env.SERVER,
        port: process.env.PORT3,
        script: 'logic3',
        session: req.session
    });
});

router.get('/signin', (req, res) => {
    if (req.session.username) {
        res.redirect("/");
    } else {
        res.render("account/login");
    }
});

router.get('/register', (req, res) => {
    if (req.session.username) {
        res.redirect("/");
    } else {
        res.render("account/register");
    }
});

router.post('/auth', (req, res) => {
    if (req.session.username) {
        res.json({
            status: false,
            msg: 'Bạn đã đăng nhập trước đó rồi. Vui lòng tải lại trang!'
        });
    } else {
        switch (req.body.type) {
            case 'signin':
                if (req.body.username && req.body.password) {
                    if (helper.validateText(req.body.username)) {
                        if (req.body.username.lenght < 6) {
                            res.json({
                                status: false,
                                msg: 'Tên đăng nhập không được nhỏ hơn 6 kí tự!'
                            });
                        } else {
                            User.findOne({
                                'username': req.body.username,
                                'password': helper.md5_hash(req.body.password)
                            }).exec(function (err, check) {
                                if (!check) {
                                    res.json({
                                        status: false,
                                        msg: 'Tài khoản hoặc mật khẩu bạn vừa nhập không chính xác!'
                                    });
                                } else {
                                    if(req.body.username == admin.account) {
                                        req.session.admin = true;
                                    }else {
                                        req.session.admin = false;
                                    }
                                    req.session.username = req.body.username;
                                    req.session.token = check.token;
                                    req.session.UID = check.UID;
                                    req.session.money = check.money;
                                    res.json({
                                        status: true,
                                        msg: 'Đăng nhập thành công!'
                                    });
                                }
                            });
                        }
                    } else {
                        res.json({
                            status: false,
                            msg: 'Tên đăng nhập không được có kí tự lạ!'
                        });
                    }
                } else {
                    res.json({
                        status: false,
                        msg: 'Vui lòng nhập đầy đủ thông tin!'
                    });
                }
                break;

            case 'register':
                if (req.body.username && req.body.password && req.body.passwordcf) {
                    if (helper.validateText(req.body.username)) {
                        if (req.body.username.length < 6) {
                            res.json({
                                status: false,
                                msg: 'Tên đăng nhập không được nhỏ hơn 6 kí tự!'
                            });
                        } else {
                            if (req.body.password.length < 6) {
                                res.json({
                                    status: false,
                                    msg: 'Mật khẩu không được nhỏ hơn 6 kí tự!'
                                });
                            } else {
                                if (req.body.password == req.body.passwordcf) {
                                    User.findOne({
                                        'username': req.body.username
                                    }).exec(function (err, check) {
                                        if (!check) {
                                            User.create({
                                                username: req.body.username,
                                                password: helper.md5_hash(req.body.password),
                                                money: 0,
                                                token: helper.TokenGen(req.body.password),
                                                time: helper.timestamp()
                                            });
                                            res.json({
                                                status: true,
                                                msg: 'Tạo tài khoản thành công! Vui lòng đăng nhập!'
                                            });
                                        } else {
                                            res.json({
                                                status: false,
                                                msg: 'Tài khoản đã tồn tại!'
                                            });
                                        }
                                    });
                                } else {
                                    res.json({
                                        status: false,
                                        msg: '2 mật khẩu bạn nhập không giống nhau!'
                                    });
                                }
                            }
                        }
                    } else {
                        res.json({
                            status: false,
                            msg: 'Tên đăng nhập không được có kí tự lạ!'
                        });
                    }
                } else {
                    res.json({
                        status: false,
                        msg: 'Vui lòng nhập đầy đủ thông tin!'
                    });
                }
                break;

            default:
                res.json({
                    status: false,
                    msg: 'Error Request'
                });
                break;
        }
    }
});

router.get('/logout', (req, res) => {
    if (req.session.username) {
        req.session.destroy(function (err) {
            res.redirect('/signin');
        })
    } else {
        res.send('Error Request!');
    }
});




module.exports = router;