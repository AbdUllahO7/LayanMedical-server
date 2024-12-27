const express = require('express');


const { 
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    handleImageUpload,
    createSubCategory , 
    getAllSubCategories ,
    deleteSubCategory} = require('../../controllers/Admin/CategoriesController');

const {upload} = require('../../helpers/cloudinary')


const router = express.Router();


router.post('/upload-image' , upload.single('my_file') , handleImageUpload);

router.post('/createCategory', createCategory);
router.put('/updateCategory/:id', updateCategory);  
router.delete('/deleteCategory/:id', deleteCategory);  
router.get('/getAllCategories', getAllCategories);  

// Subcategory routes
router.post('/categories/:categoryId/subcategories', createSubCategory);
router.get('/subcategories', getAllSubCategories);
router.delete('/categories/:categoryId/subcategories/:subCategoryId', deleteSubCategory);

module.exports = router;