const User = require("../../models/User");
const bcrypt = require('bcryptjs') // Library for hashing and comparing passwords.
const jwt = require('jsonwebtoken'); // Library for generating and verifying JSON Web Tokens (JWT).



const registerUser = async (req, res) => {
    const { userName, email, password } = req.body; // Destructuring user input from the request body
    try {
        // Check if a user already exists with the same email
        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return res.json({ success: false, message: "User already exists with the same email" });
        }

        // Hash the password with bcrypt before storing it in the database
        const hashPassword = await bcrypt.hash(password, 12);


        // Create a new user instance with the provided username, email, hashed password, and default plan
        const newUser = new User({
            userName,
            email,
            password: hashPassword,
            PlanType: defaultPlan ? [defaultPlan._id] : [] // Add default plan if found
        });

        // Save the new user to the database
        await newUser.save();

        // Respond with success message after user registration
        res.status(200).json({ success: true, message: "User registered successfully" });
        
    } catch (error) {
        console.log(error); // Log any server-side errors
        res.status(500).json({ success: false, message: "Some error occurred" });
    }
}


const loginUser = async (req, res) => {
        try {
        const { email, password } = req.body;
    
        // Check if the user exists by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
    
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
    
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid password" });
        }
    
        // Create a JWT token
        const token = jwt.sign(
            {
            id: user._id,
            role: user.role,
            email: user.email,
            userName: user.userName,
            },
            process.env.JWT_SECRET_KEY || 'CLIENT_SECRET_KEY',
            { expiresIn: '60min' }
        );
    
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        }).json({
            success: true,
            message: "User logged in successfully",
            user: {
            email: user.email,
            userName: user.userName,
            id: user._id,
            }
        });
        } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Login error occurred", error: error.message });
        }
    };
    






// Logout function: Clears the authentication token from the cookie
const logoutUser = (req, res) => {
    // Clear the 'token' cookie to log out the user
    res.clearCookie('token').json({ success: true, message: "User logged out successfully" });
}

// Authentication middleware: Verifies if the user is authenticated by checking the JWT token in cookies

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token; // Retrieve token from cookies
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated"
        });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
        
        // Fetch user data from the database using the decoded user ID
        const user = await User.findById(decoded.id).populate('PlanType'); // Populate PlanType with plan details
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Attach user object to the request
        req.user = user;

        next(); // Continue to the next middleware or route handler
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: "User not authenticated"
        });
    }
}


module.exports = { registerUser, loginUser, logoutUser, authMiddleware };



const hashExistingPassword = async () => {
  try {
    // Find the user with the plain text password (e.g., admin@admin.com)
    const user = await User.findOne({ email: 'admin@admin.com' });
    
    if (user) {
      // Check if the password is already hashed (if it starts with bcrypt hash prefix, it is hashed)
      if (!user.password.startsWith('$2a$')) {
        const hashedPassword = await bcrypt.hash(user.password, 10); // Hash the password
        user.password = hashedPassword; // Update with hashed password

        // Save the updated user object with hashed password
        await user.save();
      } else {
      }
    } else {
      console.log("User not found.");
    }
  } catch (err) {
    console.error("Error updating password:", err);
  }
};

hashExistingPassword();
