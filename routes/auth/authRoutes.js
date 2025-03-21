const express = require('express');


const { registerUser, loginUser, logoutUser, authMiddleware } = require('../../controllers/auth/AuthController');


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);  
router.post('/logout', logoutUser);  
router.get('/check-auth', authMiddleware, (req, res) => {
    const user = req.user; // Access the full user data
    res.status(200).json({
        success: true,
        message: 'Authenticated User',
        user
    });
});


module.exports = router;