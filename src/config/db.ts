import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var _mongoose: { conn: any; promise: Promise<any> | null } | undefined;
}

const connectDB = async () => {
  if (global._mongoose && global._mongoose.conn) {
    // Reuse existing connection
    return global._mongoose.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  let cached = global._mongoose;

  if (!cached) {
    cached = global._mongoose = { conn: null, promise: null };
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI as string);
  }

  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;