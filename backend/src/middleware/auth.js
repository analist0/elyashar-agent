import { getSupabase, isSupabaseAvailable } from "../lib/supabase.js";

/**
 * Express middleware to authenticate a user via Supabase session token.
 * Expects an Authorization header: Bearer <token>
 * Sets req.user = { id, email }
 *
 * When Supabase is unavailable (local dev), a valid Authorization header
 * format is still required to exercise the auth flow. The token itself is
 * not validated against the network.
 */
export async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const token = match[1];

  if (!isSupabaseAvailable()) {
    req.user = { id: "local-user", email: "local@example.com" };
    return next();
  }

  try {
    const sb = getSupabase();
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email ?? "",
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
}
