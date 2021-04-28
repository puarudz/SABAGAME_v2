require('dotenv').config();
let config = require('../config/database');
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;

mongoose.connect(config.url, config.options, (err, db) => {}); // kết nối tới databas
var db = mongoose.connection;
db.once('open', function (err) {
    if (err) console.log('Can\'t Access to Database');
    console.log('Connected to Database!');
});

module.exports = mongoose;



// const connectDb = async () => {
//     console.log(config.url);
//     try {
//         await mongoose.connect(config.url, config.options);
//         console.log('Connected to Database!');
//     } catch (error) {
//         if (err) console.log('Can\'t Access to Database');
//     }
// }

// module.exports = connectDb;