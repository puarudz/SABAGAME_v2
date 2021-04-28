const express = require("express");
const router = express.Router();
var helper = require('../app/Helpers');
var User = require('../models/users');

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
    res.render("recharge", {
        helper: helper,
        worker: false,
        session: req.session
    });
});


module.exports = router;