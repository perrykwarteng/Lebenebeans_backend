import { Router } from "express";
import { allLogs, deleteLog } from "../controllers/log.controller.js";

const router = Router();

router.get("/logs", allLogs);
router.delete("/log/:id", deleteLog);

export default router;
