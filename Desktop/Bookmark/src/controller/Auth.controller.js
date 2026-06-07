import { supabase, supabaseAdmin } from "../lib/db.js";
import { sendWelcomeEmail } from "../lib/email.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* =========================
   REGISTER
========================= */
export const register = async (req, res) => {
  try {
    const { email, password, handle } = req.body;

    if (!email || !password || !handle) {
      return res.status(400).json({
        success: false,
        message: "Email, password and handle are required.",
      });
    }

    // handle validation
    if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
      return res.status(400).json({
        success: false,
        message:
          "Handle must be 3–20 chars (lowercase, numbers, underscore only).",
      });
    }

    // check if handle exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("handle")
      .eq("handle", handle)
      .maybeSingle();

    if (checkError) {
      console.error("Handle check error:", checkError);
    }

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "That handle is already taken.",
      });
    }

    // create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data?.user) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Signup failed.",
      });
    }

    const userId = data.user.id;

    // create profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        handle,
        email,
      });

    if (profileError) {
      console.error("Profile insert error:", profileError);

      // rollback auth user (safe with admin client)
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return res.status(500).json({
        success: false,
        message: "Failed to create profile.",
      });
    }

    // email (non-blocking)
    sendWelcomeEmail(email, handle).catch(console.error);

    return res.status(201).json({
      success: true,
      message: "Account created! Check your email.",
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user || !data?.session) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // cookie
    res.cookie("token", data.session.access_token, COOKIE_OPTIONS);

    // get profile safely
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("handle")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      user: {
        id: data.user.id,
        email: data.user.email,
        handle: profile?.handle || null,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/* =========================
   LOGOUT
========================= */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "Strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/* =========================
   ME
========================= */
export const me = async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("handle, email")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) {
      console.error("ME error:", error);
    }

    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        handle: profile?.handle || null,
      },
    });
  } catch (err) {
    console.error("ME error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};
