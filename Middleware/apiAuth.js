// middleware/apiAuth.js
require('dotenv').config();

    /**
     * Middleware to authenticate API requests using API keys
     * This middleware checks for a valid API key in the request headers
     */
    const apiKeyAuth = (req, res, next) => {
    // Get API key from request header
    const apiKey = req.header('x-api-key');
    
    // Check if API key exists and matches the one in environment variables
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized. Invalid API key.' 
        });
    }
    
    // If API key is valid, proceed to the next middleware/route handler
    next();
};

module.exports = apiKeyAuth;