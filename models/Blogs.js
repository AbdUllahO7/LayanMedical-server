const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    caption: { type: String, required: true },
    slug: { type: String, required: true , unique : true },
    body: { type: Object, required: true },
    photo: { type: String, required: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: { type: [String]},
    categories: [{ type: mongoose.Schema.ObjectId , ref : 'BlogsCategories'}],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentAndRating'
    }]
}, {timestamps : true});


module.exports = mongoose.model('Blog', BlogSchema);
