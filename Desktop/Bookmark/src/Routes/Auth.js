import express from "express";
import { register, login, logout, me } from "../controller/Auth.controller.js";
import { protect } from "../middleware/Auth.Middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, me); // protected — needs valid session

export default router;
