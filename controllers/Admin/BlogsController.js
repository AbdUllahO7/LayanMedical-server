const { v4: uuidv4 } = require('uuid');
const { uploadPicture } = require('../../utils/uploadPictureMiddleware');
const CommentAndRating = require('../../models/CommentAndRating');
const { fileRemover } = require('../../utils/fileRemover');
const BlogsCategories = require('../../models/BlogsCategories');
const Blogs = require('../../models/Blogs');  // Imported Blogs model
const { createErrorResponse, getSortOption, buildSearchQuery } = require('../../utils/utils');


const createBlogs = async (req, res, next) => {
    const { userId } = req.body;  // Ensure you correctly destructure the userId

    try {
        const newBlog = new Blogs({
            title: "sample title",
            caption: "sample caption",
            slug: uuidv4(),
            body: {
                "type": "doc",
                "content": [
                  {
                    "type": "codeBlock",
                    "attrs": {
                      "language": "javascript"
                    },
                    "content": [
                      {
                        "type": "text",
                        "text": "console.log('Hello, world!');"
                      }
                    ]
                  }
                ]
              },              
            photo: "",
            owner: userId, // Use userId as the owner
        });
        
        const createdBlogs = await newBlog.save();  // Save the new blog
        return res.json({ success: true, data: createdBlogs });
    } catch (error) {
        next(error);
    }
};


const updateBlogs = async (req, res, next) => {
    try {
        const blog = await Blogs.findOne({ slug: req.params.slug });

        if (!blog) {
            const error = new Error("Blog not found");
            next(error);
            return;
        }

        const upload = uploadPicture.single("blogPicture");

        const handleUpdateBlogsData = async (data) => {
            const { title, caption, slug, body, tags, categories } = JSON.parse(data);
            blog.title = title || blog.title;
            blog.caption = caption || blog.caption;
            blog.slug = slug || blog.slug;
            blog.body = body || blog.body;
            blog.tags = tags || blog.tags;
            blog.categories = categories || blog.categories;
            const updatedBlogs = await blog.save();
            return res.json({ success: true, data: updatedBlogs });
        };

        upload(req, res, async function (err) {
            if (err) {
                const error = new Error("An unknown error occurred when uploading " + err.message);
                next(error);
            } else {
                if (req.file) {
                    let filename = blog.photo;
                    if (filename) {
                        fileRemover(filename);
                    }
                    blog.photo = req.file.filename;
                    handleUpdateBlogsData(req.body.document);
                } else {
                    let filename = blog.photo;
                    blog.photo = "";
                    fileRemover(filename);
                    handleUpdateBlogsData(req.body.document);
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const getBlogBySlug = async (req, res) => {
    const { slug } = req.params;

    try {
        if (!slug) {
            return res.status(400).json({ success: false, message: "Slug is required." });
        }

        // Find blog by slug and populate necessary fields
        const blog = await Blogs.findOne({ slug })
            .populate('owner') // Include owner details
            .populate('categories', 'title'); // Include category titles

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found." });
        }

        // Retrieve category details for additional processing (if needed)
        const categories = await BlogsCategories.find({ _id: { $in: blog.categories } });
        const categoryDetails = categories.map(cat => ({ _id: cat._id, title: cat.title }));

        return res.status(200).json({
            success: true,
            data: { ...blog.toObject(), categoryDetails },
        });
    } catch (error) {
        return createErrorResponse(res, 500, error.message);
    }
};

const getAllBlogs = async (req, res) => {
    const { sort, page = 1, limit = 10 } = req.query;

    try {
        const sortOption = getSortOption(sort);

        const blogs = await Blogs.find()
            .populate('owner')
            .populate('categories', 'title') 
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const blogDetails = await Promise.all(
            blogs.map(async (blog) => {
                const categories = await BlogsCategories.find({ _id: { $in: blog.categories } });
                const categoryDetails = categories.map(cat => ({ _id: cat._id, title: cat.title }));
                return { ...blog.toObject(), categoryDetails };
            })
        );

        const totalCount = await Blogs.countDocuments();

        return res.status(200).json({
            success: true,
            data: blogDetails,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (error) {
        return createErrorResponse(res, 500, error.message);
    }
};

const deleteBlogs = async (req, res) => {
    const { slug } = req.params;

    try {
        const blog = await Blogs.findOne({ slug });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        if (blog.photo) {
            fileRemover(blog.photo);
        }

        // Use deleteOne instead of remove
        await blog.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
            data: blog,
        });
    } catch (error) {
        console.error("Error deleting blog:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


module.exports = {
    createBlogs, updateBlogs, deleteBlogs, getBlogBySlug, getAllBlogs
};
