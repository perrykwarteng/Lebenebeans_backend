import { Router } from "express";
import {
  createPromotion,
  generatePromotionCodes,
  getPromotion,
  setPromotionStatus,
} from "../controllers/promotion.controller.js";

const router = Router();

router.post("/", createPromotion);
router.get("/", getPromotion);
router.put("/:id", setPromotionStatus);
router.post("/generateProCodes", generatePromotionCodes);

export default router;
