// routes/businessRoutes.js
const express = require('express');
const ProductsController = require('../../controllers/Admin/ProductsController');
const { upload } = require('../../helpers/cloudinary');

const router = express.Router();

// Route for uploading images
router.post('/upload-image', upload.single('my_file'), ProductsController.handleImageUpload);

// Business CRUD routes
router.get('/', ProductsController.getAllProducts);  // Fetch all products
router.post('/', ProductsController.createProducts); // Create a product
router.get('/:id', ProductsController.getProductsById); // Get a product by ID
router.put('/:id', ProductsController.updateProducts); // Update a product by ID
router.delete('/:id', ProductsController.deleteProducts); // Delete a product by ID

module.exports = router;
