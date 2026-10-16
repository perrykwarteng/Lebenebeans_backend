import cron from "node-cron";
import { resetCoupon } from "../controllers/coupon.controller.js";

export const couponJob = () => {
  cron.schedule("0 1 * * * *", resetCoupon);
};
