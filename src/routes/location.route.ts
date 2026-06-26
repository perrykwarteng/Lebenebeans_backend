import { Router } from "express";
import {
  addLocation,
  allLocation,
  deleteLocation,
  getlocation,
  updateLocation,
} from "../controllers/location.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/location", allLocation);
router.post("/location/match", getlocation);
router.post("/location", requireAuth, addLocation);
router.put("/location/:id", requireAuth, updateLocation);
router.delete("/location/:id", requireAuth, deleteLocation);

export default router;
