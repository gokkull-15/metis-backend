const mongoose = require('mongoose');

const postInteractionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AuthUser', 
    required: true 
  },
  postId: { 
    type: String, 
    required: true 
  },
  interactionType: { 
    type: String, 
    enum: ['like', 'dislike'], 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { versionKey: false });

// Compound index to ensure one interaction per user per post
postInteractionSchema.index({ userId: 1, postId: 1 }, { unique: true });
postInteractionSchema.index({ postId: 1, interactionType: 1 });

const PostInteraction = mongoose.model('PostInteraction', postInteractionSchema);

module.exports = PostInteraction;
