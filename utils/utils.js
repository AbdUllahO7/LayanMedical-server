// Create standardized response handlers
const { StatusCodes } = require('http-status-codes');
const AdminCategories = require('../models/Categories');



const categoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache-based category fetcher
exports.getCachedCategories = async (categoryIds) => {
    const now = Date.now();
    const categories = [];
    const uncachedIds = [];

    // Separate cached and uncached category IDs
    for (const id of categoryIds) {
        const cached = categoryCache.get(id.toString());
        if (cached && now - cached.timestamp < CACHE_TTL) {
            categories.push(cached.data);
        } else {
            uncachedIds.push(id);
        }
    }

    // Fetch uncached categories from DB
    if (uncachedIds.length > 0) {
        const freshCategories = await AdminCategories.find({ 
            _id: { $in: uncachedIds } 
        }).lean();

        // Cache and append fresh categories
        freshCategories.forEach(category => {
            categoryCache.set(category._id.toString(), {
                data: category,
                timestamp: now
            });
            categories.push(category);
        });
    }

    return categories;
};

// Validate categories
exports.validateCategories = async (categoryIds) => {
    const categories = await AdminCategories.find({ _id: { $in: categoryIds } });
    return categoryIds.filter(id => !categories.find(cat => cat._id.equals(id)));
};

// Validate subcategories
exports.validateSubCategories = async (subCategoryIds) => {
    const validSubCategories = await AdminCategories.find({ 
        "subCategories._id": { $in: subCategoryIds } 
    });
    return subCategoryIds.filter(id => !validSubCategories.some(cat => 
        cat.subCategories.some(sub => sub._id.equals(id))
    ));
};

// Build search query
exports.buildSearchQuery = (search, filters = {}) => (
    search 
        ? { 
            ...filters, 
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ] 
        }
        : filters
);

// Get sort option
exports.getSortOption = (sort) => ({
    'title-atoz': { title: 1 },
    'title-ztoa': { title: -1 },
    'time-newest': { createdAt: -1 },
    'time-oldest': { createdAt: 1 }
}[sort] || { createdAt: -1 });


exports.createErrorResponse = (res, statusCode, message) => res.status(statusCode).json({ success: false, message });
exports.createSuccessResponse = (res, statusCode, data) => res.status(statusCode).json({ success: true, data });
