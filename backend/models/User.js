const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Allow null/undefined but unique if present
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Villager', 'Coordinator', 'Admin', 'SuperAdmin'],
        default: 'Villager',
    },
    village: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Village',
    },
    villageName: {
        type: String,
    },
    ward: {
        type: String,
    },
    points: {
        type: Number,
        default: 0,
    },
    badges: [{
        type: String,
    }],
    isBanned: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
