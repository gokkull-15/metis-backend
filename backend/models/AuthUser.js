const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const authUserSchema = new mongoose.Schema({
  // Aadhaar nullifier for anonymous verification (large number ~128 digits)
  nullifier: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  // Auto-generated username with metis prefix
  username: { 
    type: String, 
    unique: true,
    trim: true,
    default: function() {
      return `metis${Math.floor(Math.random() * 1000000000)}`;
    }
  },
  // KYC hash generated from frontend
  kycHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: { 
    type: String,
    required: false, // Optional for KYC-based login
    minlength: 6
  },
  walletAddress: { 
    type: String, 
    required: true,
    unique: true
  },
  state: { 
    type: String, 
    required: true,
    trim: true
  },
  // User activity tracking
  postsCount: { 
    type: Number, 
    default: 0 
  },
  userLevel: { 
    type: String, 
    enum: ['new', 'active', 'super_active'], 
    default: 'new' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date 
  }
}, { versionKey: false });

// Hash password before saving
authUserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
authUserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false; // No password set
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update user level based on post count
authUserSchema.methods.updateUserLevel = function() {
  if (this.postsCount >= 10) {
    this.userLevel = 'super_active';
  } else if (this.postsCount >= 5) {
    this.userLevel = 'active';
  } else {
    this.userLevel = 'new';
  }
};

// Index for location-based queries
authUserSchema.index({ state: 1 });
authUserSchema.index({ username: 1 });
authUserSchema.index({ nullifier: 1 });
authUserSchema.index({ kycHash: 1 });

const AuthUser = mongoose.model('AuthUser', authUserSchema);

module.exports = AuthUser;
