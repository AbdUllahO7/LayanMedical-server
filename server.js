require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
// routes 

const authRouter = require('./routes/auth/authRoutes')

// user 
const ProductsRoutes = require('./routes/user/ProductsRoutes.js')



// admin 
const CategoriesRoutes = require('./routes/admin/CategoryRoutes')


// stripe 
require("dotenv").config();

mongoose
    .connect(process.env.MONGO_URI, { })
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.log("MongoDB connection error:", error));

const app = express();
const PORT = process.env.PORT || 5000;


app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Cache-Control",
            "Expires",
            "Pragma",
        ],
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());


// the routes 
app.use('/api/auth' , authRouter)

// user 
app.use('/api/ProductsRoutes' , ProductsRoutes)
app.use('/api/Categories', CategoriesRoutes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
