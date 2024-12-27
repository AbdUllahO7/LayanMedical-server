const mongoose = require('mongoose');

const CommentAndRatingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessAndService',
        required: true
    },
    
    comment: {
        type: String,
        default : ''
    },
    overallRating: {
        type: Number,
        min: 1,
        max: 5,
        default : null,

    },
    customerService: {
        type: Number,
        min: 1,
        max: 5,
        default : null,

    },
    prices: {
        type: Number,
        min: 1,
        max: 5,
        default : null,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


// Create the model
const CommentAndRating = mongoose.model('CommentAndRating', CommentAndRatingSchema);

module.exports = CommentAndRating;
