import { Router } from "express";
import {
  promoStatistics,
  statistics,
} from "../controllers/statistics.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/statistics", requireAuth, statistics);
router.get("/promo-stats", promoStatistics);

export default router;
