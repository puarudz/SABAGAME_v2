let AutoIncrement = require('mongoose-auto-increment-reworked').MongooseAutoIncrementID;
var mongoose = require('mongoose');
var PackageSettingsSchema = new mongoose.Schema({
    package_name: {
        type: String,
        required: true,
        trim: true
    },
    package_prefix: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    details: {
        type: String
    },
    thumbnail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    time: {
        type: Number,
        required: true,
        trim: true
    }
});

PackageSettingsSchema.plugin(AutoIncrement.plugin, {
    modelName: 'package_settings',
    field: '_id'
});
var PackageSettings = mongoose.model('package_settings', PackageSettingsSchema);
module.exports = PackageSettings;