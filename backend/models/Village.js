const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    district: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    wards: [{
        type: String, // Array of ward names/numbers
    }],
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const Village = mongoose.model('Village', villageSchema);

module.exports = Village;
