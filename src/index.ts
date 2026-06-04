import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import orderRouter from "./routes/orders.route.js";
import locationRouter from "./routes/location.route.js";
import statisticsRouter from "./routes/statistics.route.js";
import promotionRouter from "./routes/promotion.route.js";
import guestRouter from "./routes/guest.route.js";
import menuRouter from "./routes/menu.route.js";
import logRouter from "./routes/logs.route.js";
import userRouter from "./routes/users.routes.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const server = http.createServer(app);

const allowedOrigins: string[] = [
  process.env.FRONTEND_URL as string,
  process.env.FRONTEND_LOCAL_URL as string,
];

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;
app.set("trust proxy", true);
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/orders", orderRouter);
app.use("/api/locations", locationRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/promotion", promotionRouter);
app.use("/api/guest", guestRouter);
app.use("/api/menus", menuRouter);
app.use("/api/logs", logRouter);
app.use("/api/users", userRouter);

io.on("connection", (socket) => {
  socket;
});

server.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
