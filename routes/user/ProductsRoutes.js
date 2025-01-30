const express = require('express');
const ProductsController = require('../../controllers/Admin/ProductsController');
const { upload } = require('../../helpers/cloudinary');
const { uploadPicture, uploadImagesHandler } = require('../../utils/uploadPictureMiddleware');

const router = express.Router();

// Image upload route
router.post('/upload-image', upload.single('my_file'), ProductsController.handleImageUpload);
router.post("/upload-images", upload.array("images", 5), ProductsController.handleImageUpload);

// CRUD routes for products
router.get('/', ProductsController.getAllProducts);       // Fetch all products
router.post('/', ProductsController.createProducts);      // Create a new product
router.get('/:id', ProductsController.getProductsById);   // Get a product by ID
router.put('/:id', ProductsController.updateProducts);    // Update a product by ID
router.delete('/:id', ProductsController.deleteProducts); // Delete a product by ID

module.exports = router;
