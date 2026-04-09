import { Router } from "express";
import {
  cancelStatus,
  changeOrderStatus,
  closeOrder,
  createOrders,
  verifyTransaction,
  deliveredOrders,
  deliveredStatus,
  pendingOrders,
  webhook,
} from "../controllers/orders.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/orders", createOrders);
router.get("/pendingOrders", requireAuth, pendingOrders);
router.get("/deliveredOrders", requireAuth, deliveredOrders);
router.get("/orderDelivered/:id", requireAuth, deliveredStatus);
router.get("/orderCancle/:id", requireAuth, cancelStatus);
router.get("/verify/:reference", verifyTransaction);
router.post("/webhook", webhook);
router.get("/closeOrder", closeOrder);
router.patch("/changeOrderStatus/:id", requireAuth, changeOrderStatus);

export default router;
