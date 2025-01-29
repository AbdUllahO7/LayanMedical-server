const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categories', required: true }],
    features: { type: [String], default: [] },
    listImages: { type: [String], default: [] },
}, { timestamps: true });


module.exports = mongoose.model('Products', ProductsSchema);
