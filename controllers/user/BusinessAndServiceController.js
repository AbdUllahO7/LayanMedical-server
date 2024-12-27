
// controllers/user/BusinessAndServiceController.js
const { imageUploadUtil } = require('../../helpers/cloudinary');
const BusinessAndService = require('../../models/BusinessAndService');
const AdminCategories = require('../../models/Categories');
const mongoose = require('mongoose');
const { createErrorResponse, getSortOption, buildSearchQuery } = require('../../utils/utils');

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


// Create a new business
exports.createBusiness = async (req, res) => {
    const { BusinessType, category = [], subCategory = [], features = [] } = req.body;

    const commonRequiredFields = ['title', 'description', 'BusinessType', 'category', 'owner', 'email', 'images', 'BusinessOrAd'];
    const locationRequiredFields = BusinessType === "Location" ? ['country', 'state', 'city', 'fullAddress'] : [];
    const requiredFields = [...commonRequiredFields, ...locationRequiredFields];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        return createErrorResponse(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    try {
        const invalidCategories = await this.validateCategories(category);
        if (invalidCategories.length > 0) {
            return createErrorResponse(res, 400, `Invalid category IDs: ${invalidCategories.join(', ')}`);
        }

        const invalidSubCategories = await this.validateSubCategories(subCategory);
        if (invalidSubCategories.length > 0) {
            return createErrorResponse(res, 400, `Invalid subCategory IDs: ${invalidSubCategories.join(', ')}`);
        }

        if (!Array.isArray(features)) {
            return createErrorResponse(res, 400, 'Features must be an array.');
        }

        const newBusinessData = { ...req.body, features };
        if (BusinessType === "Online") {
            ['country', 'state', 'city'].forEach(field => {
                newBusinessData[field] = newBusinessData[field] || "";
            });
        }

        const newBusiness = new BusinessAndService(newBusinessData);
        const savedBusiness = await newBusiness.save();
        return this.createSuccessResponse(res, 201, savedBusiness);
    } catch (error) {
        return createErrorResponse(res, 400, error.message);
    }
};


// Get all businesses with user, category, and subCategory details
exports.getBusinessWithDetails = async (req, res) => {
    const { sort, search, page = 1, limit = 10 } = req.query;

    try {
        const searchQuery = buildSearchQuery(search);
        const sortOption = getSortOption(sort);

        const businesses = await BusinessAndService.find(searchQuery)
            .populate('owner')
            .populate({ path: 'category', select: 'title image' })
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const businessDetails = await Promise.all(
            businesses.map(async (business) => {
                const categories = await AdminCategories.find({ _id: { $in: business.category } });
                const categoryDetails = categories.map(cat => ({ _id: cat._id, title: cat.title, image: cat.image }));
                const subCategoryDetails = categories.flatMap(cat =>
                    cat.subCategories.filter(sub => business.subCategory.includes(sub._id.toString()))
                        .map(sub => ({ _id: sub._id, title: sub.title }))
                );

                return { ...business.toObject(), categoryDetails, subCategoryDetails };
            })
        );

        const totalCount = await BusinessAndService.countDocuments(searchQuery);
        return res.status(200).json({
            success: true,
            data: businessDetails,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (error) {
        return createErrorResponse(res, 500, error.message);
    }
};


exports.getAcceptBusinessWithDetails = async (req, res) => {
    try {
        const { category = '', subCategory = '', sort, search, country, state, city, page = 1, limit = 10 } = req.query;

        // Fetch category IDs based on title
        let categoryIds = [];
        if (category) {
            const categories = await AdminCategories.find({
                title: { $regex: category, $options: 'i' }, // Match category title (case-insensitive)
            }).select('_id');
            categoryIds = categories.map(cat => cat._id); // Extract category IDs
        }

        let subCategoryIds = [];
        if (subCategory) {
            const categories = await AdminCategories.find({
                'subCategories.title': { $regex: subCategory, $options: 'i' }
            }).select('subCategories._id subCategories.title');
        
            subCategoryIds = categories.flatMap(cat =>
                cat.subCategories
                    .filter(sub => sub.title.match(new RegExp(subCategory, 'i')))
                    .map(sub => sub._id.toString())
            );
        }
        
        // Construct filters
        const filters = {
            Accept: true,
            ...(categoryIds.length ? { category: { $in: categoryIds } } : {}), // Match category IDs
            ...(subCategoryIds.length ? { subCategory: { $in: subCategoryIds } } : {}), // Match subCategory IDs
            ...(search
                ? {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                    ],
                }
                : {}),
            ...(country ? { country: { $regex: country, $options: 'i' } } : {}),
            ...(state ? { state: { $regex: state, $options: 'i' } } : {}),
            ...(city ? { city: { $regex: city, $options: 'i' } } : {}),
        };

        // Sorting logic
        const sortOption = {
            "title-atoz": { title: 1 },
            "title-ztoa": { title: -1 },
            "time-newest": { createdAt: -1 },
            "time-oldest": { createdAt: 1 },
        }[sort] || {}; // Default to no sorting

        // Fetch businesses with filters and pagination
        const businesses = await BusinessAndService.find(filters)
            .populate('owner') // Populate owner details
            .populate({
                path: 'category',
                select: 'title image',
            })
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Map business data with category and subCategory details
        const businessDataWithCategoriesAndSubCategories = await Promise.all(
            businesses.map(async (business) => {
                const categories = await AdminCategories.find({
                    _id: { $in: business.category },
                });

                const categoryDetails = categories.map(category => ({
                    _id: category._id,
                    title: category.title,
                    image: category.image,
                }));

                const subCategoryDetails = categories.flatMap(category =>
                    category.subCategories.filter(subCat =>
                        business.subCategory.includes(subCat._id.toString())
                    ).map(subCat => ({
                        _id: subCat._id,
                        title: subCat.title,
                    }))
                );

                return {
                    ...business.toObject(),
                    categoryDetails,
                    subCategoryDetails,
                };
            })
        );

        // Total count for pagination
        const totalCount = await BusinessAndService.countDocuments(filters);

        res.status(200).json({
            success: true,
            data: businessDataWithCategoriesAndSubCategories,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};



// Update a business by ID
exports.updateBusiness = async (req, res) => {
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
        const updatedBusinessData = {
            ...req.body,
            features,   // Ensure features is passed correctly as an array
            listImages, // Update the listImages field with the new array
        };

        // Update the business only if validation is successful
        const updatedBusiness = await BusinessAndService.findByIdAndUpdate(req.params.id, updatedBusinessData, { new: true });

        if (!updatedBusiness) {
            return res.status(404).json({ success: false, message: 'Business not found' });
        }

        res.status(200).json({ success: true, data: updatedBusiness });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// Delete a business by ID
exports.deleteBusiness = async (req, res) => {
    try {
        const deletedBusiness = await BusinessAndService.findByIdAndDelete(req.params.id);
        if (!deletedBusiness) return res.status(404).json({  success :false , message: 'Business not found' });
        res.status(200).json({ success :true ,  message: 'Business deleted successfully' });
    } catch (error) {
        res.status(500).json({ success :false ,  message: error.message });
    }
};

// Get all businesses for a specific user
exports.getBusinessesByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        // Step 1: Find all businesses with the selected categories and subCategories IDs
        const businesses = await BusinessAndService.find({owner : userId})
            .populate('owner') // Populate owner details
            .populate({
                path: 'category', // Populate main category details
                select: 'title image',
            });
        // Step 2: Populate subCategory details manually
        const businessDataWithSubCategories = await Promise.all(
            businesses.map(async (business) => {
                // Find all subCategories within the matched categories that correspond to the subCategory IDs
                const categories = await AdminCategories.find({
                    _id: { $in: business.category },
                    'subCategories._id': { $in: business.subCategory }
                });

                // Extract details of all matching subCategories
                const subCategoryDetails = categories.flatMap(category =>
                    category.subCategories.filter(subCat => business.subCategory.includes(subCat._id.toString()))
                );

                return {
                    ...business.toObject(),
                    subCategoryDetails,
                };
            })
        );

        res.status(200).json({ success: true, data: businessDataWithSubCategories });
    }catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBusinessById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the business by ID and populate owner and category details
        const business = await BusinessAndService.findById(id)
            .populate('owner') // Populate owner details
            .populate({
                path: 'category', // Populate main category details
                select: 'title image',
            });
        
        if (!business) {
            return res.status(404).json({ success: false, message: 'Business not found' });
        }

        // Get categories that match the business's category IDs and contain the business's subCategory IDs
        const categories = await AdminCategories.find({
            _id: { $in: business.category },
            'subCategories._id': { $in: business.subCategory },
        });

        // Extract details of all matching subCategories
        const subCategoryDetails = categories.flatMap(category =>
            category.subCategories.filter(subCat => 
                business.subCategory.includes(subCat._id.toString())
            ).map(subCat => ({
                _id: subCat._id,
                title: subCat.title,
                // Include other properties as needed
            }))
        );

        // Return the business data with populated subCategory details
        res.status(200).json({
            success: true,
            data: {
                ...business.toObject(),
                subCategoryDetails,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Update 'open' value
exports.updateOpenValue = async (req, res) => {
    try {
        const { id } = req.params; // ID of the business or service
        const { open } = req.body; // New open value

        if (typeof open !== "boolean") {
            return res.status(400).json({ message: "'open' must be a boolean value." });
        }

        const updatedBusiness = await BusinessAndService.findByIdAndUpdate(
            id,
            { open },
            { new: true } // Return the updated document
        );

        if (!updatedBusiness) {
            return res.status(404).json({ success : false ,  message: 'Business or Service not found.' });
        }

        res.status(200).json({success : true ,  data : updatedBusiness});
    } catch (error) {
        res.status(500).json({ success : false , message: 'An error occurred.', error: error.message });
    }
};

