import { Router } from "express";

import {
  changePayment,
  getPaymentMethod,
} from "../controllers/settings.controller.js";

const router = Router();

router.get("/payment", getPaymentMethod);
router.patch("/payment/:id", changePayment);

export default router;
