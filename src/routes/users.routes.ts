import { Router } from "express";
import { deleteUser, getAllUser, resetPassword, updateUser } from "../controllers/users.controller.js";

const router = Router();

router.get("/users", getAllUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/reset-password", resetPassword);

export default router;
