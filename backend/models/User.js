const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  txHash: { type: String, required: true },
}, { versionKey: false });

const User = mongoose.model('User', userSchema);

module.exports = User;
