import { supabaseAdmin } from "../services/supabaseAdmin.js";

export async function requireCurrentUser(req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ success: false, error: "Supabase is not configured" });
    }

    const headerValue = req.headers.authorization || "";
    const jwt = headerValue.startsWith("Bearer ") ? headerValue.slice(7) : "";

    if (!jwt) {
      return res.status(401).json({ success: false, error: "Missing session" });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(jwt);

    if (error || !data?.user) {
      return res.status(401).json({ success: false, error: "Invalid session" });
    }

    req.user = data.user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function attachOptionalSession(req, res, next) {
  const headerValue = req.headers.authorization || "";
  req.sessionToken = headerValue.startsWith("Bearer ") ? headerValue.slice(7) : null;
  return next();
}
