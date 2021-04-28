var History_Model = require('../models/history');

const History = (data) => {
    try {
        return new Promise((resolve, reject) => {
            History_Model.find(data).exec((err, docs) => {
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
    History: History
}