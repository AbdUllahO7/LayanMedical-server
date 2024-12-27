// routes/businessRoutes.js
const express = require('express');
const businessController = require('../../controllers/user/BusinessAndServiceController');
const { upload } = require('../../helpers/cloudinary');

const router = express.Router();

// Route for uploading images
router.post('/upload-image', upload.single('my_file'), businessController.handleImageUpload);

// Business CRUD routes
router.post('/', businessController.createBusiness);
router.get('/', businessController.getBusinessWithDetails);
router.get('/Accept', businessController.getAcceptBusinessWithDetails);

router.get('/:id', businessController.getBusinessById);
router.put('/:id', businessController.updateBusiness);
router.delete('/:id', businessController.deleteBusiness);

router.get('/getBusinessesByUserId/:userId', businessController.getBusinessesByUserId);
router.put('/:id/open', businessController.updateOpenValue);

module.exports = router;
