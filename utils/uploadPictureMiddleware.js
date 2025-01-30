// utils/uploadPictureMiddleware.js
const multer = require("multer");
const path = require("path");
const { imageUploadUtil } = require("../helpers/cloudinary");

// Configure storage for multer
const storage = multer.memoryStorage();

// Configure upload settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1000000, // 1MB
  },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      cb(new Error("Only images are allowed"), false);
      return;
    }
    cb(null, true);
  },
});

// Create middleware for multiple file uploads
const uploadPicture = {
  array: upload.array.bind(upload)
};

// Define the upload route handler
const uploadImagesHandler = async (req, res) => {
  try {

    // Check if files exist in the request
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No images uploaded.' 
      });
    }

    // Check if number of files exceeds limit
    if (req.files.length > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum 5 images allowed.' 
      });
    }

    const uploadPromises = req.files.map(file => imageUploadUtil(file.buffer));
    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map(result => result.secure_url);

    return res.status(200).json({ 
      success: true, 
      images: imageUrls 
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error during image upload', 
      error: error.message 
    });
  }
};

module.exports = { uploadPicture, uploadImagesHandler };