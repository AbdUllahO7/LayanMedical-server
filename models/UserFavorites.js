const mongoose = require('mongoose');

// Define the User Schema
const FavoritesSchema = new mongoose.Schema({
    // Add a relationship to the BusinessAndService model
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Add a relationship to the BusinessAndService model
    businesses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessAndService',
        required : true
    }],

}, { timestamps: true });

const Favorites = mongoose.model('Favorites', FavoritesSchema);

module.exports = Favorites;
