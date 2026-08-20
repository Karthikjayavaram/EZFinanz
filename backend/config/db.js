import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (process.env.DEMO_MODE === 'true') {
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log(`[DEMO MODE] Using In-Memory MongoDB`);
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
