import express from "express";
import {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} from "../controller/Bookmarkcontroller.js";
import { protect } from "../middleware/Auth.Middleware.js";

const router = express.Router();

// All bookmark routes require login
router.use(protect);

router.get("/", getBookmarks);
router.post("/", createBookmark);
router.put("/:id", updateBookmark);
router.delete("/:id", deleteBookmark);

export default router;
