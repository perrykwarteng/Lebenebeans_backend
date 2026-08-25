import { Router } from "express";
import {
  createFeedBack,
  deleteUser,
  getAllUser,
  getFeedBack,
  resetPassword,
  updateUser,
} from "../controllers/users.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/users", requireAuth, getAllUser);
router.put("/users/:id", requireAuth, updateUser);
router.delete("/users/:id", requireAuth, deleteUser);
router.put("/users/:id/reset-password", requireAuth, resetPassword);

router.get("/feedBack", requireAuth, getFeedBack);
router.post("/feedBack", createFeedBack);

export default router;
