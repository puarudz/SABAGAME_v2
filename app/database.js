require('dotenv').config();
let config = require('../config/database');
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;

const connect = async () => {
	try {
		await mongoose.connect(config.url, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		console.log('Connected to Database!');
	} catch (err) {
        console.log('Connected to Database!');
		console.log(err.message);
	}
};

module.exports = connect;