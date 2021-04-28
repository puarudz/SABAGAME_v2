var Package_Settings_Model = require('../models/package_settings');

const Package = (data) => {
    try {
        return new Promise((resolve, reject) => {
            Package_Settings_Model.find(data).exec((err, docs) => {
                if(err) {
                    reject(err);
                }else {
                    resolve(docs);
                }
                
            });
        })
    } catch(err) {
        console.log(err);
        return err;
    }
};

const FindOne = (data) => {
    try {
        return new Promise((resolve, reject) => {
            Package_Settings_Model.findOne(data).exec((err, docs) => {
                if(err) {
                    reject(err);
                }else {
                    resolve(docs);
                }
            });
        })
    } catch(err) {
        console.log(err);
        return err;
    }
};

module.exports = {
    Package: Package
}