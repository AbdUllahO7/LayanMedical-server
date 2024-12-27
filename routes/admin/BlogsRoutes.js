const express = require('express');
const router = express.Router();
const {  createBlogs , updateBlogs  , deleteBlogs  , getBlogBySlug , getAllBlogs } = require('../../controllers/Admin/BlogsController');

router.get("/", getAllBlogs);
router.post("/", createBlogs);
router.put("/:slug", updateBlogs);
router.delete("/:slug", deleteBlogs);
router.get("/:slug", getBlogBySlug);

module.exports = router;

