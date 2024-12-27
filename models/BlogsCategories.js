const mongoose = require('mongoose');

const BlogsCategoriesSchema = new mongoose.Schema({
    title: { type: String, required: true },
}, {timestamps : true});

module.exports = mongoose.model('BlogsCategories', BlogsCategoriesSchema);
