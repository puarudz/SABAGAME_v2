var helper = require('../app/Helpers');

var Package = require('../models/package');

module.exports = () => {
    setInterval(() => {
        Package.find().then((data) => {
            data.forEach((data) => {
                if(data.time > data.time_expire) {
                    Package.deleteOne({username: data.username}).exec();
                }
            });
        });
    }, 10000);
}