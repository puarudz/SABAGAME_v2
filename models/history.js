let AutoIncrement = require('mongoose-auto-increment-reworked').MongooseAutoIncrementID;
var mongoose = require('mongoose');
var HistorySchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true
    },
    game: {
        type: String
    },
    game_func: {
        type: String
    },
    id_game: {
        type: String
    },
    status_game: {
        type: String
    },
    bet_money: {
        type: Number
    },
    bet_win: {
        type: String
    },
    money_after_bet: {
        type: Number
    },
    details: {
        type: String
    },
    time: {
        type: Number,
        required: true,
        trim: true
    }
});

HistorySchema.plugin(AutoIncrement.plugin, {
    modelName: 'histories',
    field: '_id'
});
var History = mongoose.model('histories', HistorySchema);
module.exports = History;