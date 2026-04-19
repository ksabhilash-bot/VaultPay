import express from "express";
import {
  createAdmin,
  adminLogin,
  adminLogout,
  getUser,
  getUserById,
  unapprovedUsers,
  approveUser,
} from "../controller/adminController.js";
import { protectedRoute } from "../utils/protectedRoute.js";
const router = express.Router();

router.post("/createadmin", createAdmin);
router.post("/loginadmin", adminLogin);
router.post("/logoutadmin", protectedRoute, adminLogout);
router.get("/alluser", protectedRoute, getUser);
router.get("/user/:id", protectedRoute, getUserById);
router.get("/unapprovedUsers", protectedRoute, unapprovedUsers);
router.put("/approveUser/:id", protectedRoute, approveUser);

export default router;
