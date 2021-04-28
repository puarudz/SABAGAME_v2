var User = require('../models/users');

const connectToDb = (username) => {
    // try {
    //     await User.findOne({
    //         'username': username
    //     }).exec((err, docs) => {
    //         return docs;
    //     });
    // } catch (err) {
    //     console.log(err.message);
    //     return err;
    // }

    try {
        return new Promise((resolve, reject) => {
            User.findOne({
                'username': username
            }).exec((err, docs) => {
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
    Account: connectToDb
}