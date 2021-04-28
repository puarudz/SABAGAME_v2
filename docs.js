const connectDB = require('./app/database');
var Package = require('./models/package');
var helper = require('./app/Helpers');
var histories = require('./models/history');
var UserInfo = require('./app/UserInfo');
const User = require('./models/users');

/* Connect DB */
connectDB();

    var get = UserInfo.Account('kunkeypr');
    get.then(docs => {
        console.log(docs.username);
    })




/****

histories.create({
    username: 'sdsad',
    game : 'go88',
    game_func : 'logic-1', 
    id_game: 1231323,
    bet_money: 54513212,
    time: helper.timestamp()
});

Package.create({
    username: 'kunkeypr1234',
    package: 'go88',
    time_expire: helper.timestamp(),
    time: helper.timestamp()
});

User.findOne({'username':'kunkeyprzz'}).exec(function(err, check){
    if(!check) {
        User.create({
            email: 'mm13545@gmail.com',
            username : 'kunkeyprzz',
            password: 'lamooo',
            passwordConf: 'lamoo',
            money: 0,
            token: helper.TokenGen('kunkeyprzz'),
            time: helper.timestamp()
        });           
        
        console.log('Added User');
        
    }else {
        //User.updateOne({username: 'kunkeypr'}, { $set: {password:'gluiglu', passwordConf: 'mlem mlem'}}).exec();
        //User.deleteOne({username: 'kunkeypr'}).exec();
        console.log('Username da ton tai');
    }
});

Package_Settings.create({
    package_name: 'ahiihi',
    package_prefix: 'abc',
    price: 5000,
    details: 'nothing nothing',
    thumbnail: 'https://demo.dashboardpack.com/user-management-html/img/products/02.png',
    status: '1',
    time: 154215641
});    */