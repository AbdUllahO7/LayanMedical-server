// controllers/commentAndRatingController.js

const BusinessAndService = require("../../models/BusinessAndService");
const CommentAndRating = require("../../models/CommentAndRating");
const User = require("../../models/User");



// Create a new comment and rating
exports.createCommentAndRating = async (req, res) => {
    try {
        const { user, business, comment, overallRating, customerService, prices } = req.body;


        // Validate that at least one of comment or ratings is provided
        if (!comment && !overallRating && !customerService && !prices) {
            return res.status(400).json({ error: "At least one of comment or ratings is required" });
        }

        // Create the comment and rating entry
        const newCommentAndRating = new CommentAndRating({
            user,
            business,
            comment,
            overallRating,
            customerService,
            prices,
        });

        await newCommentAndRating.save();

        // Optional: Add the comment to the user's and business's comments array
        await User.findByIdAndUpdate(user, { $push: { comments: newCommentAndRating._id } });
        await BusinessAndService.findByIdAndUpdate(business, { $push: { comments: newCommentAndRating._id } });

        res.status(201).json({ success :  true , data: newCommentAndRating});
    } catch (error) {
        res.status(400).json({  success :  false ,error: error.message });
    }
};


// Get all comments and ratings for a specific business
exports.getCommentsByBusiness = async (req, res) => {
    try {
        const { businessId } = req.params;
        const comments = await CommentAndRating.find({ business: businessId }).populate('user', 'userName');
        res.json({  success :  true , data : comments});
    } catch (error) {
        res.status(400).json({success :  false , error: error.message });
    }
};

// Get all comments and ratings by a specific user
exports.getCommentsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const comments = await CommentAndRating.find({ user: userId }).populate('business', 'title');

        res.json({  success :  true , data : comments});
    } catch (error) {
        res.status(400).json({ success :  false , error: error.message });
    }
};

// Update a comment and rating
exports.updateCommentAndRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, overallRating, customerService, prices } = req.body;

        const updatedCommentAndRating = await CommentAndRating.findByIdAndUpdate(
            id,
            { comment, overallRating, customerService, prices },
            { new: true }
        );

        res.json({ success : true, data : updatedCommentAndRating});
    } catch (error) {
        res.status(400).json({success :  false, error: error.message });
    }
};

// Delete a comment and rating
exports.deleteCommentAndRating = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCommentAndRating = await CommentAndRating.findByIdAndDelete(id);

        // Remove reference from User and BusinessAndService if needed
        await User.findByIdAndUpdate(deletedCommentAndRating.user, { $pull: { comments: id } });
        await BusinessAndService.findByIdAndUpdate(deletedCommentAndRating.business, { $pull: { comments: id } });

        res.json({ success : true,message: 'Comment and rating deleted successfully' });
    } catch (error) {
        res.status(400).json({ success:false , error: error.message });
    }
};
