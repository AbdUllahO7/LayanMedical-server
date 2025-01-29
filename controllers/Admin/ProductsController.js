const { imageUploadUtil } = require('../../helpers/cloudinary');
const Products = require('../../models/Products');
const AdminCategories = require('../../models/Categories');
const { createErrorResponse, validateCategories, createSuccessResponse } = require('../../utils/utils');

// Handle Image Upload
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

// Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Products.find()
            .populate('categories', 'title image')
            .sort({ createdAt: -1 });

        if (!products.length) {
            return res.status(404).json({ success: false, message: 'No products found' });
        }

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch products.' });
    }
};

// Create a New Product
exports.createProducts = async (req, res) => {
    const { title, description, categories = [], features = [], listImages = [] } = req.body;
    console.log(title , description , categories)
    try {
        // Validate required fields
        if (!title || !description || !categories.length) {
            return createErrorResponse(res, 400, 'Title, description, and at least one categories are required.');
        }

        // Validate categories
        const invalidCategories = await validateCategories(categories);
        if (invalidCategories.length > 0) {
            return createErrorResponse(res, 400, `Invalid categories IDs: ${invalidCategories.join(', ')}`);
        }

        const newProductData = { title, description, categories, features, listImages };
        const newProduct = new Products(newProductData);
        const savedProduct = await newProduct.save();

        return createSuccessResponse(res, 201, savedProduct);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to create product.' });
    }
};

// Update a Product by ID
exports.updateProducts = async (req, res) => {
    const { title, description, categories = [], features = [], listImages = [] } = req.body;

    try {
        const product = await Products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const invalidCategories = await validateCategories(categories);
        if (invalidCategories.length > 0) {
            return res.status(400).json({ success: false, message: `Invalid categories IDs: ${invalidCategories.join(', ')}` });
        }

        const updatedData = {};
        if (title) updatedData.title = title;
        if (description) updatedData.description = description;
        if (categories.length) updatedData.categories = categories;
        if (features.length) updatedData.features = features;
        if (listImages.length) updatedData.listImages = listImages;

        const updatedProduct = await Products.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update product.' });
    }
};

// Delete a Product by ID
exports.deleteProducts = async (req, res) => {
    try {
        const deletedProduct = await Products.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to delete product.' });
    }
};

// Get a Product by ID
exports.getProductsById = async (req, res) => {
    try {
        const product = await Products.findById(req.params.id)
            .populate('categories', 'title image');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch product.' });
    }
};
