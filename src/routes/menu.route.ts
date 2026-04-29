import { Router } from "express";
import { addMenu, allMenu } from "../controllers/menu.controller.js";

const router = Router();

router.get("/menu", allMenu);
router.post("/menu", addMenu);

export default router;
