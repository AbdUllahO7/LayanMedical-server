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
        res.status(201).json({ success: true, message: 'category created successfully', data: newCategory });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await AdminCategories.find();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(201).json({ success: true, message: 'category updated successfully', data: updatedCategory });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// Delete a category by ID
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await AdminCategories.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
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
};
