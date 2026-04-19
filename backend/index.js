import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
import adminRouter from "./router/adminRouter.js";
import cookieParser from "cookie-parser";
import userRouter from "./router/userRoute.js";

dotenv.config();

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000", process.env.DOMAIN, "*"],
    credentials: true,
  }),
);

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Welcome to the Bank API");
});
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📌 Test it: http://localhost:${PORT}/`);
    });
  } catch (err) {
    console.error("❌ Error starting server:", err.message);
    process.exit(1);
  }
};

startServer();
