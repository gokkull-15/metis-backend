const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  postId: { type: String, required: true, unique: true },
  caption: { type: String, required: true, maxlength: 1000 },
  hashtags: { type: [String], default: [] },
  walletAddress: { type: String }, // Keep for backward compatibility
  imageUrl: { type: String, required: true }, // IPFS hash
  likeCount: { type: Number, default: 0 },
  dislikeCount: { type: Number, default: 0 },
  comment: { type: [String], default: [] },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  // User and location information
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AuthUser',
    required: true 
  },
  authorUsername: { type: String, required: true },
  authorState: { type: String, required: true }, // For location-based filtering
  authorLevel: { 
    type: String, 
    enum: ['new', 'active', 'super_active'], 
    default: 'new' 
  },
  // Post status tracking
  reportCount: { type: Number, default: 0 },
  lastInteraction: { type: Date, default: Date.now }
}, { versionKey: false });

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ postId: 1 });
postSchema.index({ active: 1, authorState: 1, createdAt: -1 });
postSchema.index({ authorState: 1, active: 1 });
postSchema.index({ dislikeCount: 1, active: 1 });

// Method to check if post should be deactivated
postSchema.methods.checkAndDeactivate = function() {
  if (this.dislikeCount >= 10) {
    this.active = false;
  }
  return this.active;
};

const Post = mongoose.model('Post', postSchema, 'posts');

module.exports = Post;