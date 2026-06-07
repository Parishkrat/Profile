import express from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/Auth.js";
import bookmarkRoutes from "./routes/Bookmark.js";
import profileRoutes from "./routes/profiles.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/profile", profileRoutes);

// Page routes — serve HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/Login.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/Register.html"));
});
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/Dashboard.html"));
});
// Public profile page /@handle
app.get("/:handle", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/Profile.html"));
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
