import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import orderRouter from "./routes/orders.route.js";
import locationRouter from "./routes/location.route.js";
import statisticsRouter from "./routes/statistics.route.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/orders", orderRouter);
app.use("/api/locations", locationRouter);
app.use("/api/statistics", statisticsRouter);

io.on("connection", (socket) => {
  socket;
});

server.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
