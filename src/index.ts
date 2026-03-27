import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route";
import orderRouter from "./routes/orders.route";

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/orders", orderRouter);

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
