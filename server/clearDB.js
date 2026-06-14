import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from './models/Request.js';
import Bid from './models/Bid.js';
import Message from './models/Message.js';

dotenv.config();

const clearDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reverse_market';
    console.log(`Connecting to database at ${connStr.replace(/:([^@]+)@/, ':****@')}...`);
    await mongoose.connect(connStr);
    
    // Deleting all demo requests, bids, and messages
    const reqDel = await Request.deleteMany({});
    const bidDel = await Bid.deleteMany({});
    const msgDel = await Message.deleteMany({});
    
    console.log('Database Cleanup Successful:');
    console.log(`- Deleted ${reqDel.deletedCount} requests.`);
    console.log(`- Deleted ${bidDel.deletedCount} bids.`);
    console.log(`- Deleted ${msgDel.deletedCount} messages.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning database:', err);
    process.exit(1);
  }
};

clearDB();
