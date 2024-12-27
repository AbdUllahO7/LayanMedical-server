// routes/commentAndRatingRoutes.js

const express = require('express');
const router = express.Router();
const commentAndRatingController = require('../../controllers/user/CommentAndRatingController');

// Route to create a new comment and rating
router.post('/', commentAndRatingController.createCommentAndRating);

// Route to get all comments for a specific business
router.get('/business/:businessId', commentAndRatingController.getCommentsByBusiness);

// Route to get all comments by a specific user
router.get('/user/:userId', commentAndRatingController.getCommentsByUser);

// Route to update a comment and rating
router.put('/:id', commentAndRatingController.updateCommentAndRating);

// Route to delete a comment and rating
router.delete('/:id', commentAndRatingController.deleteCommentAndRating);

module.exports = router;
