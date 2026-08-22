import mongoose from 'mongoose';

/**
 * MongoDB / Mongoose Connection Handler
 * Connects to MongoDB when MONGODB_URI is provided, with clean failover.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[MongoDB] MONGODB_URI not defined. Operating with resilient in-memory Mongoose models layer.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Database Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Database connection unavailable (${error.message}). Operating with resilient in-memory Mongoose models layer.`);
    return null;
  }
};
