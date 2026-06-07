import { supabase } from "../lib/db.js";

// Protects routes — reads token from cookie and verifies with Supabase
export const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized. Please log in." });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({
      success: false,
      message: "Session expired. Please log in again.",
    });
  }

  req.user = user; // full Supabase user object (user.id, user.email, etc.)
  req.token = token; // pass token along for Supabase RLS queries
  next();
};
