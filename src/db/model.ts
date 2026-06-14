import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

const transactionSchema = new mongoose.Schema({
  transaction: String,
  users: [String],
});

const orderSchema = new mongoose.Schema({
  phoneNumber: String,
  message: String,
  status: { type: String, default: "pending" }, // pending or done
  date: { type: Date, default: Date.now },
});

export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export const OrderObj =
  mongoose.models.OrderObj ||
  mongoose.model("OrderObj", orderSchema);
