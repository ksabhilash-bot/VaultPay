import e from "express";
import {
  signup,
  login,
  logout,
  balance,
  transactions,
  addMoney,
  transferMoney,
  verifyPayment,
} from "../controller/userController.js";
import { protectedRoute } from "../utils/protectedRoute.js";

const router = e.Router();

router.post("/signupuser", signup);
router.post("/loginuser", login);
router.post("/logoutuser", logout);
router.get("/balance", protectedRoute, balance);
router.get("/gettransactions", protectedRoute, transactions);

router.post("/addmoney", protectedRoute, addMoney);
router.post("/transfermoney", protectedRoute, transferMoney);
router.post("/verifypayment", protectedRoute, verifyPayment);

export default router;
