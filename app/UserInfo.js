var User = require('../models/users');

const Account = (data) => {
    try {
        return new Promise((resolve, reject) => {
            User.find(data).exec((err, docs) => {
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
            User.findOne(data).exec((err, docs) => {
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

const Creat = (data) => {
    try {
        return new Promise((resolve, reject) => {
            User.create(data, (err, docs) => {
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
} 

const DeleteOne = (data) => {
    try {
        return new Promise((resolve, reject) => {
            User.deleteOne(data).exec((err, docs) => {
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
} 

const UpdateOne = (data) => {
    try {
        return new Promise((resolve, reject) => {
            User.updateOne(data, (err, docs) => {
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
} 

module.exports = {
    Account: Account,
    FindOne: FindOne,
    Creat: Creat,
    DeleteOne: DeleteOne,
    UpdateOne: UpdateOne
}