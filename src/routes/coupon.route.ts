import { Router } from "express";
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  getCoupons,
  updateCoupon,
} from "../controllers/coupon.controller.js";

const router = Router();

router.post("/coupon", createCoupon);
router.get("/coupons", getCoupons);
router.get("/coupon/:id", getCoupon);
router.patch("/coupon/:id", updateCoupon);
router.delete("/coupon/:id", deleteCoupon);

export default router;
