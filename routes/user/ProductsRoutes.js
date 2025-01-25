// routes/businessRoutes.js
const express = require('express');
const ProductsController = require('../../controllers/Admin/ProductsController');
const { upload } = require('../../helpers/cloudinary');

const router = express.Router();

// Route for uploading images
router.post('/upload-image', upload.single('my_file'), ProductsController.handleImageUpload);

// Business CRUD routes
router.post('/', ProductsController.createProducts);
router.get('/:id', ProductsController.getProductsById);
router.put('/:id', ProductsController.updateProducts);
router.delete('/:id', ProductsController.deleteProducts);


module.exports = router;
