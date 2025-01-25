const mongoose = require('mongoose');

// const SubCategorySchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     image: String,
//     // You can also add a reference to another category if needed
//     // categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories' }
// });

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
