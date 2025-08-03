require('dotenv').config();
const AuthUser = require('../models/AuthUser');
const { generateToken } = require('../utils/jwt');

// Check if nullifier exists (first step of registration)
const checkNullifier = async (req, res) => {
  try {
    const { nullifier } = req.body;

    if (!nullifier) {
      return res.status(400).json({
        success: false,
        message: 'Nullifier is required'
      });
    }

    // Check if nullifier already exists
    const existingUser = await AuthUser.findOne({ nullifier });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This Aadhaar has already been used for registration'
      });
    }

    res.json({
      success: true,
      message: 'Nullifier is valid and available for registration'
    });

  } catch (error) {
    console.error('Check nullifier error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking nullifier'
    });
  }
};

// Register user with nullifier and other details
const register = async (req, res) => {
  try {
    const { nullifier, kycHash, password, walletAddress, state } = req.body;

    // Validation
    if (!nullifier || !kycHash || !walletAddress || !state) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: nullifier, kycHash, walletAddress, state. Password is optional.'
      });
    }

    // Check if nullifier already exists
    const existingNullifier = await AuthUser.findOne({ nullifier });
    if (existingNullifier) {
      return res.status(409).json({
        success: false,
        message: 'This Aadhaar has already been used for registration'
      });
    }

    // Check if KYC hash already exists
    const existingKycHash = await AuthUser.findOne({ kycHash });
    if (existingKycHash) {
      return res.status(409).json({
        success: false,
        message: 'This KYC hash has already been used'
      });
    }

    // Check if wallet address already exists
    const existingWallet = await AuthUser.findOne({ walletAddress });
    if (existingWallet) {
      return res.status(409).json({
        success: false,
        message: 'Wallet address already registered'
      });
    }

    // Generate unique username with metis prefix
    let username;
    let isUnique = false;
    while (!isUnique) {
      username = `metis${Math.floor(Math.random() * 1000000000)}`;
      const existingUsername = await AuthUser.findOne({ username });
      if (!existingUsername) {
        isUnique = true;
      }
    }

    // Create new user
    const user = new AuthUser({
      nullifier,
      username,
      kycHash,
      password: password || undefined, // Only set if provided
      walletAddress,
      state: state.toLowerCase().trim(),
      postsCount: 0,
      userLevel: 'new'
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        kycHash: user.kycHash,
        walletAddress: user.walletAddress,
        state: user.state,
        userLevel: user.userLevel,
        postsCount: user.postsCount
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login with username and password
const login = async (req, res) => {
  try {
    const { username, password, kycHash } = req.body;

    // Support both username/password and KYC hash login
    if (!kycHash && (!username || !password)) {
      return res.status(400).json({
        success: false,
        message: 'Either kycHash or username/password are required'
      });
    }

    let user;

    if (kycHash) {
      // Login with KYC hash
      user = await AuthUser.findOne({ kycHash, isActive: true });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid KYC hash'
        });
      }
    } else {
      // Login with username/password
      user = await AuthUser.findOne({ username, isActive: true });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        kycHash: user.kycHash,
        walletAddress: user.walletAddress,
        state: user.state,
        userLevel: user.userLevel,
        postsCount: user.postsCount,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        walletAddress: req.user.walletAddress,
        state: req.user.state,
        userLevel: req.user.userLevel,
        postsCount: req.user.postsCount,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

// Update User Profile (limited fields)
const updateProfile = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (walletAddress) {
      // Check if wallet address already exists for another user
      const existingWallet = await AuthUser.findOne({ 
        walletAddress, 
        _id: { $ne: userId } 
      });
      if (existingWallet) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address already registered by another user'
        });
      }
      updateData.walletAddress = walletAddress;
    }

    const user = await AuthUser.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password -nullifierHash');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        walletAddress: user.walletAddress,
        state: user.state,
        userLevel: user.userLevel,
        postsCount: user.postsCount
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get user dashboard with all user data and posts
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    const user = await AuthUser.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all user's posts with full details
    const Post = require('../models/Post');
    const userPosts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username state userLevel');

    // Calculate total likes and dislikes across all posts
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likeCount, 0);
    const totalDislikes = userPosts.reduce((sum, post) => sum + post.dislikeCount, 0);
    const activePosts = userPosts.filter(post => post.active).length;
    const inactivePosts = userPosts.filter(post => !post.active).length;

    res.json({
      success: true,
      dashboard: {
        userInfo: {
          id: user._id,
          username: user.username,
          kycHash: user.kycHash,
          walletAddress: user.walletAddress,
          state: user.state,
          userLevel: user.userLevel,
          postsCount: user.postsCount,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        postStats: {
          totalPosts: userPosts.length,
          activePosts,
          inactivePosts,
          totalLikes,
          totalDislikes,
          engagementRatio: userPosts.length > 0 ? ((totalLikes + totalDislikes) / userPosts.length).toFixed(2) : 0
        },
        posts: userPosts.map(post => ({
          _id: post._id,
          postId: post.postId,
          caption: post.caption,
          imageUrl: post.imageUrl,
          likeCount: post.likeCount,
          dislikeCount: post.dislikeCount,
          active: post.active,
          createdAt: post.createdAt,
          lastInteraction: post.lastInteraction,
          location: post.location || 'Not specified'
        }))
      }
    });

  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user dashboard',
      error: error.message
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

module.exports = {
  checkNullifier,
  register,
  login,
  getCurrentUser,
  updateProfile,
  getUserDashboard,
  logout
};
