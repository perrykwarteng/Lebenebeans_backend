import { Router } from "express";
import {
  addRider,
  allAssaignOrdeer,
  allNotAssignedOrdeer,
  assignOrderRider,
  deleteRider,
  getRiders,
} from "../controllers/dispatch.controller.js";

const router = Router();

router.get("/riders", getRiders);
router.post("/riders", addRider);
router.delete("/riders/:id", deleteRider);
router.get("/orders/assigned", allAssaignOrdeer);
router.get("/orders/unassigned", allNotAssignedOrdeer);
router.post("/orders/assign", assignOrderRider);

export default router;
