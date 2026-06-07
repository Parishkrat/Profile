import { supabaseAdmin } from "../lib/db.js";

// GET /api/bookmarks — get all bookmarks for logged-in user
export const getBookmarks = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookmarks")
      .select("*")
      .eq("user_id", req.user.id) // ALWAYS filter by logged-in user's ID
      .order("created_at", { ascending: false });

    if (error)
      return res.status(500).json({ success: false, message: error.message });

    return res.status(200).json({ success: true, bookmarks: data });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

// POST /api/bookmarks — create a bookmark
export const createBookmark = async (req, res) => {
  try {
    const { title, url, is_public } = req.body;

    if (!title || !url) {
      return res
        .status(400)
        .json({ success: false, message: "Title and URL are required." });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid URL." });
    }

    const { data, error } = await supabaseAdmin
      .from("bookmarks")
      .insert({
        user_id: req.user.id, // always set from server — never trust client
        title: title.trim(),
        url: url.trim(),
        is_public: is_public === true,
      })
      .select()
      .single();

    if (error)
      return res.status(500).json({ success: false, message: error.message });

    return res.status(201).json({ success: true, bookmark: data });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

// PUT /api/bookmarks/:id — update a bookmark (only owner can update)
export const updateBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, is_public } = req.body;

    if (!title || !url) {
      return res
        .status(400)
        .json({ success: false, message: "Title and URL are required." });
    }

    try {
      new URL(url);
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid URL." });
    }

    // The WHERE clause includes BOTH id AND user_id — server enforces ownership
    const { data, error } = await supabaseAdmin
      .from("bookmarks")
      .update({
        title: title.trim(),
        url: url.trim(),
        is_public: is_public === true,
      })
      .eq("id", id)
      .eq("user_id", req.user.id) // ownership check: only update YOUR row
      .select()
      .single();

    if (error)
      return res.status(500).json({ success: false, message: error.message });
    if (!data)
      return res.status(404).json({
        success: false,
        message: "Bookmark not found or access denied.",
      });

    return res.status(200).json({ success: true, bookmark: data });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

// DELETE /api/bookmarks/:id — delete a bookmark (only owner can delete)
export const deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;

    // The WHERE clause includes BOTH id AND user_id — server enforces ownership
    const { data, error } = await supabaseAdmin
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id) // ownership check: only delete YOUR row
      .select()
      .single();

    if (error)
      return res.status(500).json({ success: false, message: error.message });
    if (!data)
      return res.status(404).json({
        success: false,
        message: "Bookmark not found or access denied.",
      });

    return res
      .status(200)
      .json({ success: true, message: "Bookmark deleted." });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};
