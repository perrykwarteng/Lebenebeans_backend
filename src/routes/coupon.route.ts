import { Router } from "express";
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  getCoupons,
  getCouponUsedList,
  updateCoupon,
} from "../controllers/coupon.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/coupon", createCoupon);
router.get("/coupons", getCoupons);
router.get("/couponsUsed", requireAuth, getCouponUsedList);
router.get("/coupon/:id", getCoupon);
router.patch("/coupon/:id", updateCoupon);
router.delete("/coupon/:id", deleteCoupon);

export default router;
