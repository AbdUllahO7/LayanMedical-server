// Create standardized response handlers
const AdminCategories = require('../models/Categories');



// Validate categories
exports.validateCategories = async (categoryIds) => {
    const categories = await AdminCategories.find({ _id: { $in: categoryIds } });
    return categoryIds.filter(id => !categories.find(cat => cat._id.equals(id)));
};



exports.createErrorResponse = (res, statusCode, message) => res.status(statusCode).json({ success: false, message });
exports.createSuccessResponse = (res, statusCode, data) => res.status(statusCode).json({ success: true, data });
