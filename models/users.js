let AutoIncrement = require('mongoose-auto-increment-reworked').MongooseAutoIncrementID;
let mongoose = require('mongoose');
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


UserSchema.plugin(AutoIncrement.plugin, {modelName: 'users', field:'UID'});
var User = mongoose.model('users', UserSchema);
module.exports = User;