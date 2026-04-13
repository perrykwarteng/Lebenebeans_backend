import { Router } from "express";
import {
  createPromotion,
  getPromotion,
  setPromotionStatus,
} from "../controllers/promotion.controller.js";

const router = Router();

router.post("/", createPromotion);
router.get("/", getPromotion);
router.put("/:id", setPromotionStatus);

export default router;
