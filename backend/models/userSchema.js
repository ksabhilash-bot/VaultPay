// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    accountNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    isApproved: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    balance: { type: Number, default: 0 },
    wallet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Wallet" 
  },
  
  transactions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Transaction" 
  }],
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
