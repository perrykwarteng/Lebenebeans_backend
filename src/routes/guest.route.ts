import { Router } from "express";
import { getGuest, getGuestHistory } from "../controllers/guest.controller.js";

const router = Router();

router.get("/guest/", getGuest);
router.get("/guestHistory/", getGuestHistory);

export default router;
