var Package = require('../app/Package');

module.exports = () => {
    setInterval(() => {
        Package.Package().then(data => {
            data.forEach((data) => {
                if(data.time > data.time_expire) {
                    Package.deleteOne({username: data.username}).exec();
                }
            });
        });
    }, 5000);
}