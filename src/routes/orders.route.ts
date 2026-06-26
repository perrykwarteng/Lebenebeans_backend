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
  FailedOrders,
  deleteStatus,
  hubtelWebhook,
  statusTransaction,
} from "../controllers/orders.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/orders", createOrders);
router.get("/pendingOrders", requireAuth, pendingOrders);
router.get("/deliveredOrders", requireAuth, deliveredOrders);
router.get("/failedOrders", requireAuth, FailedOrders);
router.patch("/orderDelivered/:id", requireAuth, deliveredStatus);
router.patch("/orderCancel/:id", requireAuth, cancelStatus);
router.delete("/orderDelete/:id", requireAuth, deleteStatus);
router.get("/verify/:reference", verifyTransaction);
router.get("/transactionStatus/:clientReference", statusTransaction);
router.post("/webhook", webhook);
router.post("/webhook-hubtel", hubtelWebhook);
router.get("/closeOrder", closeOrder);
router.patch("/changeOrderStatus/:id", requireAuth, changeOrderStatus);

export default router;
