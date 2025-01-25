
// controllers/user/ProductsController.js
const { imageUploadUtil } = require('../../helpers/cloudinary');
const Products = require('../../models/Products');
const AdminCategories = require('../../models/Categories');
const mongoose = require('mongoose');
const { createErrorResponse, getSortOption, buildSearchQuery, validateCategories, validateSubCategories, createSuccessResponse } = require('../../utils/utils');

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


// Create a new Products
exports.createProducts = async (req, res) => {


    console.log("create ")
    const { ProductsType, category = [], subCategory = [], features = [] } = req.body;

    const commonRequiredFields = ['title', 'description', 'ProductsType', 'category', 'owner', 'email', 'images', 'ProductsOrAd'];
    console.log(req.body)
    const locationRequiredFields = ProductsType === "Location" ? ['country', 'state', 'city', 'fullAddress'] : [];
    const requiredFields = [...commonRequiredFields, ...locationRequiredFields];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        return createErrorResponse(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    try {

        const invalidCategories = await validateCategories(category);
        if (invalidCategories.length > 0) {
            return createErrorResponse(res, 400, `Invalid category IDs: ${invalidCategories.join(', ')}`);
        }


        const invalidSubCategories = await validateSubCategories(subCategory);
        if (invalidSubCategories.length > 0) {
            return createErrorResponse(res, 400, `Invalid subCategory IDs: ${invalidSubCategories.join(', ')}`);
        }
        console.log("saved")

        if (!Array.isArray(features)) {
            return createErrorResponse(res, 400, 'Features must be an array.');
        }

        const newProductsData = { ...req.body, features };
        if (ProductsType === "Online") {
            ['country', 'state', 'city'].forEach(field => {
                newProductsData[field] = newProductsData[field] || "";
            });
        }

        const newProducts = new Products(newProductsData);
        const savedProducts = await newProducts.save();
        console.log(savedProducts)

        return createSuccessResponse(res, 201, savedProducts);
    } catch (error) {
        return createErrorResponse(res, 400, error.message);
    }
};

// Update a Products by ID
exports.updateProducts = async (req, res) => {
    const requiredFields = ['title', 'description', 'category', 'owner', 'email', 'country', 'state', 'city', 'images', 'subCategory', 'fullAddress'];
    const missingFields = requiredFields.filter(field => req.body[field] === undefined);

    if (missingFields.length > 0) {
        return res.status(400).json({ success: false, message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    try {
        const { category = [], subCategory = [], features = [], listImages = [] } = req.body;

        // Validate each category
        const invalidCategories = await Promise.all(
            category.map(async (catId) => {
                const categoryData = await AdminCategories.findById(catId);
                return categoryData ? null : catId;
            })
        );

        if (invalidCategories.filter(Boolean).length > 0) {
            return res.status(400).json({ success: false, message: `Invalid category IDs: ${invalidCategories.filter(Boolean).join(', ')}` });
        }

        // Validate each subCategory
        const invalidSubCategories = await Promise.all(
            subCategory.map(async (subCatId) => {
                const validSubCategory = await AdminCategories.findOne({ "subCategories._id": subCatId });
                return validSubCategory ? null : subCatId;
            })
        );

        if (invalidSubCategories.filter(Boolean).length > 0) {
            return res.status(400).json({ success: false, message: `Invalid subCategory IDs: ${invalidSubCategories.filter(Boolean).join(', ')}` });
        }

        // Ensure features is an array if provided
        if (features && !Array.isArray(features)) {
            return res.status(400).json({ success: false, message: 'Features must be an array.' });
        }

        // Ensure listImages is an array if provided
        if (listImages && !Array.isArray(listImages)) {
            return res.status(400).json({ success: false, message: 'listImages must be an array.' });
        }

        // Prepare the data for updating
        const updatedProductsData = {
            ...req.body,
            features,   // Ensure features is passed correctly as an array
            listImages, // Update the listImages field with the new array
        };

        // Update the Products only if validation is successful
        const updatedProducts = await Products.findByIdAndUpdate(req.params.id, updatedProductsData, { new: true });

        if (!updatedProducts) {
            return res.status(404).json({ success: false, message: 'Products not found' });
        }

        res.status(200).json({ success: true, data: updatedProducts });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// Delete a Products by ID
exports.deleteProducts = async (req, res) => {
    try {
        const deletedProducts = await Products.findByIdAndDelete(req.params.id);
        if (!deletedProducts) return res.status(404).json({  success :false , message: 'Products not found' });
        res.status(200).json({ success :true ,  message: 'Products deleted successfully' });
    } catch (error) {
        res.status(500).json({ success :false ,  message: error.message });
    }
};


exports.getProductsById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the Products by ID and populate owner and category details
        const Products = await Products.findById(id)
            .populate('owner') // Populate owner details
            .populate({
                path: 'category', // Populate main category details
                select: 'title image',
            });
        
        if (!Products) {
            return res.status(404).json({ success: false, message: 'Products not found' });
        }

        // Get categories that match the Products's category IDs and contain the Products's subCategory IDs
        const categories = await AdminCategories.find({
            _id: { $in: Products.category },
            'subCategories._id': { $in: Products.subCategory },
        });

        // Extract details of all matching subCategories
        const subCategoryDetails = categories.flatMap(category =>
            category.subCategories.filter(subCat => 
                Products.subCategory.includes(subCat._id.toString())
            ).map(subCat => ({
                _id: subCat._id,
                title: subCat.title,
                // Include other properties as needed
            }))
        );

        // Return the Products data with populated subCategory details
        res.status(200).json({
            success: true,
            data: {
                ...Products.toObject(),
                subCategoryDetails,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};




