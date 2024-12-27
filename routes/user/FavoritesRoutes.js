const express = require('express');
const router = express.Router();
const { createFavorite, getFavorites, deleteFavorite, createOrUpdateFavorite } = require('../../controllers/user/FavoritesContrller');

// Create a new favorite
router.post('/favorites', createOrUpdateFavorite
);

// Get favorites for a user
router.get('/favorites/:userId', getFavorites);

// Delete a business from a user's favorites
router.delete('/favorites/:userId/:businessId', deleteFavorite);


module.exports = router;
