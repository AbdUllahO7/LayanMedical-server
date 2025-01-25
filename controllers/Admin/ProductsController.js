const { imageUploadUtil } = require('../../helpers/cloudinary');
const Products = require('../../models/Products');
const AdminCategories = require('../../models/Categories');
const { createErrorResponse, validateCategories, createSuccessResponse } = require('../../utils/utils');

exports.handleImageUpload = async (req, res) => {
    try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const url = `data:${req.file.mimetype};base64,${b64}`;
        const result = await imageUploadUtil(url);

        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error during image upload' });
    }
};


// Get all Products
exports.getAllProducts = async (req, res) => {
    try {
        // Retrieve all products and populate category details
        const products = await Products.find()
            .populate('category', 'title image') // Populate category title and image
            .sort({ createdAt: -1 }); // Sort by creation date in descending order

        if (!products || products.length === 0) {
            return res.status(404).json({ success: false, message: 'No products found' });
        }

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Create a new Product
exports.createProducts = async (req, res) => {
    const { title, description, category = [], features = [], listImages = [] } = req.body;

    const commonRequiredFields = ['title', 'description', 'category', 'owner', 'email', 'images', 'ProductsOrAd'];
    const locationRequiredFields = req.body.ProductsType === "Location" ? ['country', 'state', 'city', 'fullAddress'] : [];
    const requiredFields = [...commonRequiredFields, ...locationRequiredFields];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        return createErrorResponse(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    try {
        // Validate categories
        const invalidCategories = await validateCategories(category);
        if (invalidCategories.length > 0) {
            return createErrorResponse(res, 400, `Invalid category IDs: ${invalidCategories.join(', ')}`);
        }

        // Ensure features is an array if provided
        if (features && !Array.isArray(features)) {
            return createErrorResponse(res, 400, 'Features must be an array.');
        }

        // Prepare the new product data
        const newProductData = { title, description, category, features, listImages };

        // Create and save the new product
        const newProduct = new Products(newProductData);
        const savedProduct = await newProduct.save();

        return createSuccessResponse(res, 201, savedProduct);
    } catch (error) {
        return createErrorResponse(res, 400, error.message);
    }
};


// Update a Product by ID
exports.updateProducts = async (req, res) => {
    const { title, description, category = [], features = [], listImages = [] } = req.body;

    try {
        // Validate categories
        const invalidCategories = await Promise.all(
            category.map(async (catId) => {
                const categoryData = await AdminCategories.findById(catId);
                return categoryData ? null : catId;
            })
        );

        if (invalidCategories.filter(Boolean).length > 0) {
            return res.status(400).json({ success: false, message: `Invalid category IDs: ${invalidCategories.filter(Boolean).join(', ')}` });
        }

        // Ensure features and listImages are arrays
        if (features && !Array.isArray(features)) {
            return res.status(400).json({ success: false, message: 'Features must be an array.' });
        }

        if (listImages && !Array.isArray(listImages)) {
            return res.status(400).json({ success: false, message: 'List images must be an array.' });
        }

        // Prepare updated data
        const updatedProductData = { title, description, category, features, listImages };

        // Update product
        const updatedProduct = await Products.findByIdAndUpdate(req.params.id, updatedProductData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// Delete a Product by ID
exports.deleteProducts = async (req, res) => {
    try {
        const deletedProduct = await Products.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a Product by ID
exports.getProductsById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Products.findById(id).populate('category', 'title image');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

