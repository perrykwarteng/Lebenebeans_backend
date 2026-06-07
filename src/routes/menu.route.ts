import { Router } from "express";
import {
  addMenu,
  allMenu,
  updateMenu,
  deleteMenu,
  toggleMenuAvailability,
} from "../controllers/menu.controller.js";

import { upload } from "../middlewares/upload.js";

const router = Router();

router.get("/menu", allMenu);
router.post("/menu", upload.single("image"), addMenu);
router.put("/menu/:id", upload.single("image"), updateMenu);
router.delete("/menu/:id/:userId", deleteMenu);
router.patch("/menu/:id/availability", toggleMenuAvailability);

export default router;
