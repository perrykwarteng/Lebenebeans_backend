import { Router } from "express";
import {
  changePassword,
  login,
  logout,
  me,
  register,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", requireAuth, me);
router.post("/logout", logout);
router.put("/change-password", changePassword);

export default router;
