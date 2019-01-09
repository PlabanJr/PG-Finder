var mongoose = require('mongoose');

var user_CustomerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    user_type: Number,
});

module.exports = mongoose.model('user_Customer', user_CustomerSchema);

