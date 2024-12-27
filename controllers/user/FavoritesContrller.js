const mongoose = require('mongoose');
const Favorites = require("../../models/UserFavorites");

exports.createOrUpdateFavorite = async (req, res) => {
    const { userId, businessIds } = req.body;

    try {
        // Ensure `businessIds` are converted to `ObjectId` format
        const objectIds = businessIds.map(id => new mongoose.Types.ObjectId(id));

        // Find the user's current favorites
        let favorite = await Favorites.findOne({ user: userId });

        if (!favorite) {
            // If no favorites exist, create a new entry and add the businesses
            favorite = new Favorites({
                user: userId,
                businesses: objectIds
            });
        } else {
            // Toggle each business ID in the array
            objectIds.forEach(objectId => {
                if (favorite.businesses.some(id => id.equals(objectId))) {
                    // If the business is already in the list, remove it
                    favorite.businesses = favorite.businesses.filter(id => !id.equals(objectId));
                } else {
                    // If the business is not in the list, add it
                    favorite.businesses.push(objectId);
                }
            });
        }

        // Save the updated favorites
        await favorite.save();
        await favorite.populate('businesses'); // Populate business details

        return res.status(200).json({
            success: true,
            message: 'Favorites updated successfully',
            data: favorite
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error adding or updating favorite',
            error: error.message
        });
    }
};


// Fetch user's favorite businesses with business details
exports.getFavorites = async (req, res) => {
    const { userId } = req.params;

    try {
        // Populate the 'businesses' field to return full business details
        const favorite = await Favorites.findOne({ user: userId }).populate('businesses');

        if (!favorite || favorite.businesses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No favorites found for this user'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Favorites fetched successfully',
            data: favorite.businesses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching favorites',
            error: error.message
        });
    }
};


// Delete a business from user's favorites
exports.deleteFavorite = async (req, res) => {
    const { userId, businessId } = req.params; // Assuming userId and businessId are passed in params

    try {
        const favorite = await Favorites.findOne({ user: userId });

        if (!favorite) {
            return res.status(404).json({success : false , message: 'No favorites found for this user' });
        }

        // Remove the business from the favorites list
        const index = favorite.businesses.indexOf(businessId);
        if (index === -1) {
            return res.status(404).json({ success : false , message: 'Business not found in favorites' });
        }

        favorite.businesses.splice(index, 1);
        await favorite.save();

        res.status(200).json({ success : true , message: 'Business removed from favorites successfully', data :  favorite });
    } catch (error) {
        res.status(500).json({success : false , message: 'Error removing favorite', error: error.message });
    }
};