let AutoIncrement = require('mongoose-auto-increment-reworked').MongooseAutoIncrementID;
var mongoose = require('mongoose');
var PackageSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    package: {
        required: true,
        type: String
    },
    time_expire: {
        type: Number,
        required: true,
        trim: true
    },
    time: {
        type: Number,
        required: true,
        trim: true
    }
});

PackageSchema.plugin(AutoIncrement.plugin, {
    modelName: 'packages',
    field: '_id'
});
var Package = mongoose.model('packages', PackageSchema);
module.exports = Package;