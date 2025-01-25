const mongoose = require('mongoose');

// Define the User Schema
const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
