import { getSupabase, isSupabaseAvailable } from "../lib/supabase.js";

/**
 * Express middleware to restrict an endpoint to admin users only.
 * Must be applied after authenticateUser.
 * Returns HTTP 404 when access is denied (to avoid revealing endpoint existence).
 */
export async function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user?.id) {
    return res.status(404).json({ success: false, error: "Not found" });
  }

  // Allow env-based admin email override in local dev or for recovery.
  if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
    return next();
  }

  if (!isSupabaseAvailable()) {
    return res.status(404).json({ success: false, error: "Not found" });
  }

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !data || data.role !== "admin") {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    next();
  } catch (error) {
    return res.status(404).json({ success: false, error: "Not found" });
  }
}
