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
  likePost,
  dislikePost,
  updatePost,
  deletePost 
} = require('../controllers/postController');

// Public routes
router.get('/all', getAllPosts); // Get all posts (admin/testing)

// Protected routes (require authentication)
router.post('/', authenticate, createPost); // Create new post
router.get('/', authenticate, getPostsByLocation); // Get posts by user's location (state)
router.get('/my-posts', authenticate, getMyPosts); // Get user's posts

// Like/Dislike functionality (protected)
router.post('/:postId/like', authenticate, likePost); // Like a post
router.post('/:postId/dislike', authenticate, dislikePost); // Dislike a post

// Post management (protected)
router.put('/:postId', authenticate, updatePost); // Update post
router.delete('/:postId', authenticate, deletePost); // Delete post

// Public route for specific post (with location check if authenticated)
router.get('/:postId', authenticate, getPostById); // Get specific post by ID

module.exports = router;