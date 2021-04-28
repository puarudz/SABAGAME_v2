const express = require("express");
const router = express.Router();
var helper = require('../app/Helpers');
var User = require('../models/users');
var Package = require('../models/package');
var Package_Settings = require('../models/package_settings');

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
    Package_Settings.find().
    exec((er, data) => {
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
        Package_Settings.findOne().
        where('package_prefix').equals(req.body.package_id).
        exec((err, data) => {
            if (err) {
                res.json({
                    status: false,
                    msg: err
                });
            } else {
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
        Package_Settings.findOne().
        where('package_prefix').equals(req.body.package_id).
        exec((err, data_package) => {
            if (err) {
                res.json({
                    status: false,
                    msg: err
                });
            } else {
                Package.findOne().
                where('username').equals(req.session.username).
                where('package').equals(req.body.package_id).
                exec((err, data_checker) => {
                    if (data_checker) {
                        res.json({
                            status: false,
                            msg: 'Bạn đã mua chức năng này trước đó rồi!'
                        });
                    } else {
                        if (req.session.money < data_package.price) {
                            res.json({
                                status: false,
                                msg: 'Tài khoản của bạn không đủ để mua chức năng này!'
                            });
                        } else {
                            User.updateOne({
                                username: req.session.username
                            }, {
                                $inc: {
                                    money: -data_package.price
                                }
                            }).exec((err, user_buy) => {
                                if (err) {
                                    res.json({
                                        status: false,
                                        msg: err
                                    });
                                } else {
                                    var now = helper.timestamp();
                                    var uoc_tinh = 86400 * 30;

                                    Package.create({
                                        username: req.session.username,
                                        package: req.body.package_id,
                                        time_expire: now + uoc_tinh,
                                        time: now
                                    });

                                    // session updated 
                                    req.session.money = req.session.money - data_package.price;
                                    res.json({
                                        status: true,
                                        msg: 'Mua chức năng thành công!'
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