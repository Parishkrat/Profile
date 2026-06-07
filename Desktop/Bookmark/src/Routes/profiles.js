import express from "express";
import { getPublicProfile } from "../controller/Profile.js";

const router = express.Router();

// Public — no auth required
router.get("/:handle", getPublicProfile);

export default router;
