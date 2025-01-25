// routes/businessRoutes.js
const express = require('express');
const ProductsController = require('../../controllers/Admin/ProductsController');
const { upload } = require('../../helpers/cloudinary');

const router = express.Router();

// Route for uploading images
router.post('/upload-image', upload.single('my_file'), ProductsController.handleImageUpload);

// Business CRUD routes
router.post('/', ProductsController.createBusiness);
router.get('/', ProductsController.getBusinessWithDetails);
router.get('/Accept', ProductsController.getAcceptBusinessWithDetails);

router.get('/:id', ProductsController.getBusinessById);
router.put('/:id', ProductsController.updateBusiness);
router.delete('/:id', ProductsController.deleteBusiness);

router.get('/ProductsController/:userId', ProductsController.getBusinessesByUserId);
router.put('/:id/open', ProductsController.updateOpenValue);

module.exports = router;
