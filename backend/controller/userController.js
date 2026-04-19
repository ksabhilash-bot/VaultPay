import userSchema from "../models/userSchema.js";
import walletSchema from "../models/walletSchema.js";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "../utils/tokenHandler.js";
import e from "express";
import transactionSchema from "../models/transactionSchema.js";
import crypto from "crypto";
import razorpay from "../utils/razorpaysetup.js";
import { truncate } from "fs/promises";
import mongoose from "mongoose";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }
    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    const newUser = new userSchema({
      name,
      email,
      password: hashedPassword,
      accountNumber,
    });
    const wallet = await walletSchema.create({ user: newUser._id });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully and wallet created",
      data: "wait for approval",
    });
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }
    const user = await userSchema.findOne({
      email,
    });
    if (!user || user.isApproved === false) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials or account not approved yet",
      });
    }
    if(user.role === "admin"){
      return res.status(400).json({
        success: false,        message: "Admins cannot log in here",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const userdata = user.toObject();
    delete userdata.password;
    const token = generateToken(userdata);
    res.cookie("bankToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: userdata,
    });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.bankToken;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token found",
      });
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }
    res.clearCookie("bankToken");
    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Error during user logout:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const balance = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Balance fetched successfully",
      data: user.balance,
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const transactions = async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await transactionSchema
      .find({
        $or: [
          {
            sender: userId,
          },
          { receiver: userId },
        ],
      })
      .populate("sender", "name email accountNumber")
      .populate("receiver", "name email accountNumber")
      .sort({ createdAt: -1 })
      .select("amount type status");

    if (!transactions) {
      return res.status(404).json({
        success: false,
        message: "No transactions found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const addMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const transaction = await transactionSchema.create({
      receiver: userId,
      amount,
      type: "ADD_MONEY",
      status: "PENDING",
      razorpayOrderId: order.id,
    });

    return res.status(200).json({
      success: true,
      message: "Money transfer started",
      order,
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Error adding money:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // ✅ Payment verified
    const transaction = await transactionSchema.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status === "SUCCESS") {
      return res.json({ message: "Already processed" });
    }

    transaction.status = "SUCCESS";
    transaction.razorpayPaymentId = razorpay_payment_id;
    await transaction.save();

    // 💰 Update user balance
    await userSchema.findByIdAndUpdate(transaction.receiver, {
      $inc: { balance: transaction.amount },
    });

    return res.json({ message: "Payment successful" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const transferMoney = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { toEmail, amount } = req.body;

    if (!toEmail || amount <= 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    session.startTransaction();

    const sender = await userSchema.findById(req.userId).session(session);
    const receiver = await userSchema
      .findOne({ email: toEmail })
      .session(session);

    if (!receiver) {
      throw new Error("Receiver not found");
    }

    if (sender.balance < amount) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    // Deduct from sender
    sender.balance -= amount;
    await sender.save({ session });

    // Add to receiver
    receiver.balance += amount;
    await receiver.save({ session });

    // Create transaction
    const transaction = await transactionSchema.create(
      [
        {
          sender: sender._id,
          receiver: receiver._id,
          amount,
          type: "TRANSFER",
          status: "SUCCESS",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return res.json({
      message: "Transfer successful",
      transaction,
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
