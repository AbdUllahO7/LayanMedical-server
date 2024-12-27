const { imageUploadUtil } = require('../../helpers/cloudinary');
const AdminCategories = require('../../models/Categories');


const handleImageUpload = async (req , res ) => {
    try {

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const url = "data:"+req.file.mimetype +";base64," + b64;
        const result = await imageUploadUtil(url);

        res.json({
            success : true,
            result
        })
        
    } catch (error) {
        console.log(error);
        res.json({success : false , message : 'error catch' });
        
    }
};


// Create a new category
const createCategory = async (req, res) => {
    try {
        const { title, image } = req.body;
        const newCategory = await AdminCategories.create({ title, image });
        res.status(201).json({ success : true, message : 'category created successfully ' ,data : newCategory});
    } catch (error) {
        res.status(500).json({ success : false ,  error: error.message });
    }
};

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await AdminCategories.find();
        res.status(200).json({success : true , data : categories});
    } catch (error) {
        res.status(500).json({ success : false , error: error.message });
    }
};

// Get a single category by ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await AdminCategories.findById(id);
        if (!category) {
            return res.status(404).json({ success : false, message: 'Category not found' });
        }
        res.status(200).json({ success : true, data : category});
    } catch (error) {
        res.status(500).json({ success : false, error: error.message });
    }
};

// Update a category by ID
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, image } = req.body;
        const updatedCategory = await AdminCategories.findByIdAndUpdate(
            id,
            { title, image },
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ success : false ,message: 'Category not found' });
        }
        res.status(201).json({success : true , message : 'category updated successfully ' , data : updatedCategory});
    } catch (error) {
        res.status(500).json({ success : false , error: error.message });
    }
};

// Delete a category by ID
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await AdminCategories.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({success : false , message: 'Category not found' });
        }
        res.status(200).json({ success : true , message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({success : false , error: error.message });
    }
};

// Create a subcategory
const createSubCategory = async (req, res) => {
    try {
        const { categoryId } = req.params; // Ensure you're getting the right ID
        const { title, image } = req.body; // Make sure these match your frontend data

        // Debug log to verify received data
        console.log("Received title and image:", title);

        const updatedCategory = await AdminCategories.findByIdAndUpdate(
            categoryId,
            { $push: { subCategories: { title, image } } },
            { new: true }
        );
        
        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        
        res.status(201).json({ success: true, message: 'Subcategory added successfully', data: updatedCategory });
    } catch (error) {
        console.error("Error adding subcategory:", error); // Log the error for debugging
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all subcategories for a category
const getAllSubCategories = async (req, res) => {
    try {
        const { categoryIds } = req.query; // Expect categoryIds as a comma-separated string

        // Check if categoryIds is defined and is a string
        if (!categoryIds || typeof categoryIds !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid categoryIds' });
        }

        const categoryIdArray = categoryIds.split(','); // Split IDs into an array
        
        const categories = await AdminCategories.find({ _id: { $in: categoryIdArray } }).populate('subCategories');

        if (!categories || categories.length === 0) {
            return res.status(404).json({ success: false, message: 'No categories found' });
        }

        // Combine subcategories from all selected categories
        const allSubCategories = categories.flatMap(category => category.subCategories);
        
        res.status(200).json({ success: true, data: allSubCategories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


const deleteSubCategory = async (req, res) => {
    try {
        const { categoryId, subCategoryId } = req.params; // Get the IDs from the request params
        const updatedCategory = await AdminCategories.findByIdAndUpdate(
            categoryId,
            { $pull: { subCategories: { _id: subCategoryId } } }, // Remove the subcategory by its ID
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Subcategory deleted successfully', data: updatedCategory });
    } catch (error) {
        console.error("Error deleting subcategory:", error); // Log the error for debugging
        res.status(500).json({ success: false, error: error.message });
    }
};


module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    handleImageUpload,
    createSubCategory,
    getAllSubCategories,
    deleteSubCategory
};
