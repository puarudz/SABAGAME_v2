require('dotenv').config();
const connectDB = require('./app/database');
var express = require('express');
var session = require('express-session');
var app = express();
app.use(express.json());
app.use(express.urlencoded());

app.use(session({
    resave: true, 
    saveUninitialized: true, 
    secret: process.env.SESSION_SECRET, 
    cookie: {
        maxAge: 60000 * 1440
    }
}));

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static(__dirname + '/public'));


/* Connect DB */
connectDB();

// xóa user hết hạn
var Cron_Expires = require('./app/Cron_Expires');
Cron_Expires();

// Router 
var index = require('./routes/index');
var package = require('./routes/package');
var recharge = require('./routes/recharge')
var admin = require('./routes/admin');



app.use('/', index);
app.use('/package', package);
app.use('/recharge', recharge);
app.use('/admin', admin);

//The 404 Route (ALWAYS Keep this as the last route)
app.use(function(req,res){
    res.status(404).render('404');
});

const server = app.listen(80, () => console.log(`Started server at port: 80`));