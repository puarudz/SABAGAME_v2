const express = require("express");
const router = express.Router();
var helper = require('../app/Helpers');
var User = require('../app/userinfo');
var Package = require('../app/package');
var Package_Settings = require('../app/package_settings');

// middleware check login
function authChecker(req, res, next) {
    if (req.session.username || req.path === '/signin' || req.path === '/auth' || req.path === '/register') {
        next();
    } else {
        res.redirect("/signin");
    }
}

router.use(authChecker);

router.get('/', function (req, res) {
    res.send('Path Not Found!');
});

router.get('/buy-package', function (req, res) {
    Package_Settings.Package().then(data => {
        res.render("buy_package", {
            helper: helper,
            worker: false,
            data: data,
            session: req.session
        });
    });
});


router.post('/package_info', function (req, res) {
    if (req.body.package_id) {
        Package_Settings.FindOne({
            package_prefix: req.body.package_id
        }).then(data => {
            if(!data) {
                res.json({
                    status: false,
                    msg: 'Package Not Found!'
                });
            }else {
                res.json({
                    status: true,
                    data: data,
                    msg: 'Success'
                });
            }
        });
    } else {
        res.render({
            status: false,
            msg: 'Missing Field'
        });
    }
});



router.post('/package_buy', function (req, res) {
    if (req.body.package_id) {
        
        Package_Settings.FindOne({
            package_prefix: req.body.package_id
        }).then(data => {
            if(!data) {
                res.json({
                    status: false,
                    msg: 'Package Not Found'
                });
            }else {
                Package.FindOne({
                    username : req.session.username,
                    package: req.body.package_id                    
                }).then(data => {
                    if(data) {
                        res.json({
                            status: false,
                            msg: 'Bạn đã mua chức năng này trước đó rồi!'
                        });                        
                    }else {
                        if (req.session.money < data_package.price) {
                            res.json({
                                status: false,
                                msg: 'Tài khoản của bạn không đủ để mua chức năng này!'
                            });
                        } else {

                            User.UpdateOne({
                                username: req.session.username
                            }, {
                                $inc: {
                                    money: -data_package.price
                                }
                            }).then(data => {
                                if (!data) {
                                    res.json({
                                        status: false,
                                        msg: 'User Not Found'
                                    });
                                } else {
                                    var now = helper.timestamp();
                                    var uoc_tinh = 86400 * 30;

                                    Package.Creat({
                                        username: req.session.username,
                                        package: req.body.package_id,
                                        time_expire: now + uoc_tinh,
                                        time: now
                                    }).then(data => {
                                        res.json({
                                            status: true,
                                            msg: 'Mua chức năng thành công!'
                                        });
                                    req.session.money = req.session.money - data_package.price;                                                                                
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });

    } else {
        res.render({
            status: false,
            msg: 'Missing Field'
        });
    }
});


module.exports = router;