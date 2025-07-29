const User = require('../models/User');

// Save or update user
const saveUser = async (req, res) => {
  const { walletAddress, userId, txHash } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { walletAddress },
      { userId, txHash },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'User saved successfully', user });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by wallet address
const getUserByWallet = async (req, res) => {
  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ message: 'Wallet address is required' });
  }

  try {
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  saveUser,
  getUserByWallet
};
