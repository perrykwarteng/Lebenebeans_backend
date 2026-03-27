import { Router } from "express";
import {
  createOrders,
  verifyTransaction,
} from "../controllers/orders.controller.js";

const router = Router();

router.post("/orders", createOrders);
router.get("/verify/:reference", verifyTransaction);

export default router;
