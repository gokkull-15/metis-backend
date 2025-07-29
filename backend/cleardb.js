const mongoose = require('mongoose');
require('dotenv').config();

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Drop all collections
    await mongoose.connection.db.dropDatabase();
    console.log('Database cleared successfully');
    
    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
