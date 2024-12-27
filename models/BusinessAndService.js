const mongoose = require('mongoose');

const BusinessAndServiceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    BusinessType: { type: String, required: true },
    BusinessOrAd: { type: String, required: true },
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categories', required: true }],
    subCategory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categories.subCategories' }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    country: { type: String, required: function() { return this.BusinessType === 'Location'; }},
    state: { type: String, required: function() { return this.BusinessType === 'Location'; }},
    city: { type: String, required: function() { return this.BusinessType === 'Location'; }},
    map: { type: String, required: function() { return this.BusinessType === 'Location'; }},
    fullAddress: { type: String, required: function() { return this.BusinessType === 'Location'; }},
    phone: { type: String },
    images: { type: String },
    open: { type: Boolean, default: true },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    Accept: { type: Boolean, default: false },
    features: { type: [String], default: [] }, 
    listImages: { type: [String], default: [] },  
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentAndRating'
    }]
},{ timestamps: true });

module.exports = mongoose.model('BusinessAndService', BusinessAndServiceSchema);
