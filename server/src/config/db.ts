import mongoose from 'mongoose';

let connectionPromise: Promise<typeof mongoose> | null = null;

/** Connects once and caches the promise so warm serverless invocations reuse it. */
export function connectDB(): Promise<typeof mongoose> {
  if (!connectionPromise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not set');
    connectionPromise = mongoose.connect(uri).then((conn) => {
      console.log('MongoDB connected');
      return conn;
    });
  }
  return connectionPromise;
}
