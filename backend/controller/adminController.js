import userSchema from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "../utils/tokenHandler.js";
import e from "express";
import walletSchema from "../models/walletSchema.js";

//create admin

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name && !email && !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the details",
      });
    }

    const existingAdmin = await userSchema.findOne({
      email,
      role: "admin",
    });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newAdmin = await userSchema.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      isApproved: true,
    });

    const admin = newAdmin.toObject();
    delete admin.password;

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: admin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating admin",
      error: error.message,
    });
  }
};

//login admin

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the details",
      });
    }

    const admin = await userSchema.findOne({
      email,
      role: "admin",
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (admin.role === "user") {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const admindata = admin.toObject();
    delete admindata.password;

    const token = generateToken(admin);

    const isProd = process.env.isProd;
    res.cookie("bankToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      success: true,
      message: "adminLogged in successfully",
      token,
      data: admindata,
    });
  } catch (error) {
    console.error("Error logging in admin:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging in admin",
      error: error.message,
    });
  }
};

// admin logout
export const adminLogout = async (req, res) => {
  try {
    const token = req.cookies.bankToken;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token found",
      });
    }
    const isValid = await verifyToken(token);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }
    res.clearCookie("bankToken");
    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    console.error("Error logging out admin:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging out admin",
      error: error.message,
    });
  }
};

//to get user according to query
export const getUser = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const users = await userSchema
      .find({ role: "user" })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalUsers = await userSchema.countDocuments({ role: "user" });
    const totalPages = Math.ceil(totalUsers / limit);
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting user from admin route",
      error: error.message,
    });
  }
};

//to get a particular user and his wallet info
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userSchema
      .findById(userId)
      .select("-password")
      .populate("wallet")
      .populate("transactions");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error getting user by id:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting user by id from admin route",
      error: error.message,
    });
  }
};

//to list unapproved users for admin to approve
export const unapprovedUsers = async (req, res) => {
  try {
    const users = await userSchema
      .find({ role: "user", isApproved: false })
      .select("-password");
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users to approve",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error approving user:", error);
    return res.status(500).json({
      success: false,
      message: "Error approving user from admin route",
      error: error.message,
    });
  }
};

//to approve user by admin by id
export const approveUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const isApproved = req.body.isApproved;
    if (isApproved === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide approval status",
      });
    }
    const user = await userSchema.findById(userId).select("-password");
    const wallet = await walletSchema.findOne({ user: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (isApproved === false) {
      if (user.role === "admin") {
        return res.status(400).json({
          success: false,
          message: "Cannot reject an admin user",
        });
      }
      await userSchema.findByIdAndDelete(userId);
      await walletSchema.findByIdAndDelete(wallet._id);
      return res.status(200).json({
        success: true,
        message: "User rejected and deleted successfully",
      });
    }
    user.isApproved = isApproved;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "User approval status updated successfully",
    });
  } catch (error) {
    console.error("Error approving user:", error);
    return res.status(500).json({
      success: false,
      message: "Error approving user from admin route",
      error: error.message,
    });
  }
};
