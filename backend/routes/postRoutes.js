require('dotenv').config();
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { 
  createPost, 
  createPostLegacy,
  getAllPosts,
  getPostsByLocation,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost 
} = require('../controllers/postController');

// Public routes
router.get('/all', getAllPosts); // Get all posts (admin/testing)

// Protected routes (require authentication)
router.post('/', authenticate, createPost); // Create new post
router.get('/', authenticate, getPostsByLocation); // Get posts by user's location (state)
router.get('/my-posts', authenticate, getMyPosts); // Get user's posts

// Post management (protected)
router.put('/:postId', authenticate, updatePost); // Update post
router.delete('/:postId', authenticate, deletePost); // Delete post

// Public route for specific post (with location check if authenticated)
router.get('/:postId', authenticate, getPostById); // Get specific post by ID

module.exports = router;