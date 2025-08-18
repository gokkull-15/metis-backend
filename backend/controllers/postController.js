const Post = require('../models/Post');
const AuthUser = require('../models/AuthUser');
const PostInteraction = require('../models/PostInteraction');

// Generate unique postId
const generatePostId = () => {
  return 'POST-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
};

// Create a new post (requires authentication)
const createPost = async (req, res) => {
  try {
    const { caption, hashtags, imageUrl } = req.body;

    // Basic validation
    if (!caption || !imageUrl) {
      return res.status(400).json({ 
        success: false,
        message: 'Caption and image URL (IPFS hash) are required' 
      });
    }

    const postId = generatePostId();

    // Ensure postId is unique
    const existing = await Post.findOne({ postId });
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: 'Post ID already exists, try again.' 
      });
    }

    const newPost = new Post({
      postId,
      caption,
      hashtags: hashtags || [],
      walletAddress: req.user.walletAddress,
      imageUrl, // IPFS hash
      likeCount: 0,
      dislikeCount: 0,
      comment: [],
      active: true,
      author: req.user._id,
      authorUsername: req.user.username,
      authorState: req.user.state,
      authorLevel: req.user.userLevel
    });

    await newPost.save();

    // Update user's post count and level
    req.user.postsCount += 1;
    req.user.updateUserLevel();
    await req.user.save();

    res.status(201).json({ 
      success: true,
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get posts by location (user's state) - location-based filtering
const getPostsByLocation = async (req, res) => {
  try {
    const userState = req.user.state;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ 
      authorState: userState, 
      active: true 
    })
    .populate('author', 'username state userLevel')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalPosts = await Post.countDocuments({ 
      authorState: userState, 
      active: true 
    });

    res.status(200).json({ 
      success: true, 
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNext: page < Math.ceil(totalPosts / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching posts by location:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all posts (admin function or testing) - with location info
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ active: true })
      .populate('author', 'username state userLevel')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ active: true });

    res.status(200).json({ 
      success: true, 
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts
      }
    });
  } catch (error) {
    console.error("Error fetching all posts:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get posts by authenticated user
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ 
      author: req.user._id, 
      active: true 
    })
    .populate('author', 'username state userLevel')
    .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      posts,
      count: posts.length,
      user: {
        username: req.user.username,
        userLevel: req.user.userLevel,
        postsCount: req.user.postsCount,
        state: req.user.state
      }
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findOne({ postId, active: true });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user already interacted with this post
    const existingInteraction = await PostInteraction.findOne({ userId, postId });
    
    if (existingInteraction) {
      if (existingInteraction.interactionType === 'like') {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already liked this post' 
        });
      } else {
        // User had disliked, now wants to like - update interaction
        existingInteraction.interactionType = 'like';
        await existingInteraction.save();
        
        // Update post counts
        post.likeCount += 1;
        post.dislikeCount -= 1;
        post.lastInteraction = new Date();
        await post.save();

        return res.status(200).json({
          success: true,
          message: 'Post liked successfully (changed from dislike)',
          post: {
            postId: post.postId,
            likeCount: post.likeCount,
            dislikeCount: post.dislikeCount
          }
        });
      }
    }

    // Create new like interaction
    const newInteraction = new PostInteraction({
      userId,
      postId,
      interactionType: 'like'
    });
    await newInteraction.save();

    // Update post like count
    post.likeCount += 1;
    post.lastInteraction = new Date();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      post: {
        postId: post.postId,
        likeCount: post.likeCount,
        dislikeCount: post.dislikeCount
      }
    });

  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Dislike a post
const dislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findOne({ postId, active: true });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user already interacted with this post
    const existingInteraction = await PostInteraction.findOne({ userId, postId });
    
    if (existingInteraction) {
      if (existingInteraction.interactionType === 'dislike') {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already disliked this post' 
        });
      } else {
        // User had liked, now wants to dislike - update interaction
        existingInteraction.interactionType = 'dislike';
        await existingInteraction.save();
        
        // Update post counts
        post.dislikeCount += 1;
        post.likeCount -= 1;
        post.lastInteraction = new Date();
        
        // Check if post should be deactivated
        post.checkAndDeactivate();
        await post.save();

        return res.status(200).json({
          success: true,
          message: 'Post disliked successfully (changed from like)',
          post: {
            postId: post.postId,
            likeCount: post.likeCount,
            dislikeCount: post.dislikeCount,
            active: post.active
          }
        });
      }
    }

    // Create new dislike interaction
    const newInteraction = new PostInteraction({
      userId,
      postId,
      interactionType: 'dislike'
    });
    await newInteraction.save();

    // Update post dislike count
    post.dislikeCount += 1;
    post.lastInteraction = new Date();
    
    // Check if post should be deactivated (10+ dislikes)
    post.checkAndDeactivate();
    await post.save();

    res.status(200).json({
      success: true,
      message: post.active ? 'Post disliked successfully' : 'Post disliked and deactivated due to excessive dislikes',
      post: {
        postId: post.postId,
        likeCount: post.likeCount,
        dislikeCount: post.dislikeCount,
        active: post.active
      }
    });

  } catch (error) {
    console.error("Error disliking post:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get a specific post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ 
      postId: req.params.postId, 
      active: true 
    }).populate('author', 'username state userLevel');
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if authenticated user can see this post (same state)
    if (req.user && req.user.state !== post.authorState) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only view posts from your state' 
      });
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Legacy create post function (for backward compatibility)
const createPostLegacy = async (req, res) => {
  try {
    const { caption, hashtags, walletAddress, imageUrl } = req.body;

    if (!caption || !walletAddress || !imageUrl) {
      return res.status(400).json({ 
        success: false,
        message: 'Caption, wallet address, and image URL are required' 
      });
    }

    const postId = generatePostId();

    const existing = await Post.findOne({ postId });
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: 'Post ID already exists, try again.' 
      });
    }

    // For legacy posts, create without proper user context
    const newPost = new Post({
      postId,
      caption,
      hashtags: hashtags || [],
      walletAddress,
      imageUrl,
      likeCount: 0,
      dislikeCount: 0,
      comment: [],
      active: true,
      author: null,
      authorUsername: 'Anonymous',
      authorState: 'unknown',
      authorLevel: 'new'
    });

    await newPost.save();

    res.status(201).json({ 
      success: true,
      message: 'Post saved successfully',
      post: newPost
    });
  } catch (error) {
    console.error("Error saving legacy post:", error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

module.exports = {
  createPost,
  createPostLegacy,
  getAllPosts,
  getPostsByLocation,
  getMyPosts,
  likePost,
  dislikePost,
  getPostById
};