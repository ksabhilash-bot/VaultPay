import { verifyToken } from "./tokenHandler.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.bankToken;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token found",
      });
    }

    const isValid = await verifyToken(token);
    
    req.userId = isValid.id;
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }
    next();
  } catch (error) {
    console.log("protected route error", error);
    return res.status(500).json({
      success: false,
      message: "Error in protected route",
      error: error.message,
    });
  }
};
