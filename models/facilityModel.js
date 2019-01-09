var mongoose = require('mongoose');

var facility_Schema = new mongoose.Schema({

    facility: [
        {
            _id: String,
            name: String,
            sharing: Number,
            address: String,
            landmark: String,
            phone: String,
        }
    ],
    
});

module.exports = mongoose.model('facility', facility_Schema);

