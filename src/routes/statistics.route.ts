import { Router } from "express";
import { statistics } from "../controllers/statistics.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/statistics", requireAuth, statistics);

export default router;
