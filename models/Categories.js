const mongoose = require('mongoose');


const CategoriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image: String,
});

// Create the model for the Categories collection
const AdminCategories = mongoose.model('Categories', CategoriesSchema);
module.exports = AdminCategories;
