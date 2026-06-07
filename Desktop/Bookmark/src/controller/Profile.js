import { supabaseAdmin } from "../lib/db.js";

// GET /api/profile/:handle — public profile with only public bookmarks
export const getPublicProfile = async (req, res) => {
  try {
    const { handle } = req.params;

    // Look up profile by handle
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, handle")
      .eq("handle", handle)
      .maybeSingle();

    if (profileError || !profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found." });
    }

    // Only return PUBLIC bookmarks — server enforces this, not the client
    const { data: bookmarks, error: bookmarkError } = await supabaseAdmin
      .from("bookmarks")
      .select("id, title, url, created_at")
      .eq("user_id", profile.id)
      .eq("is_public", true) // <-- privacy enforced here on server
      .order("created_at", { ascending: false });

    if (bookmarkError) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to load bookmarks." });
    }

    return res.status(200).json({
      success: true,
      profile: { handle: profile.handle },
      bookmarks,
    });
  } catch (err) {
    console.error("Profile error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};
