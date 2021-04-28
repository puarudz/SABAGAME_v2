let AutoIncrement = require('mongoose-auto-increment-reworked').MongooseAutoIncrementID;
let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    money: {
        type: Number,
        required: true,
        trim: true
    },
    token: {
        type: String,
        required: true,
        trim: true
    },
    time: {
        type: Number,
        required: true,
        trim: true
    }
});


UserSchema.plugin(AutoIncrement.plugin, {modelName: 'Users', field:'UID'});
var User = mongoose.model('Users', UserSchema);
module.exports = User;