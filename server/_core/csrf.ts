import { randomBytes } from "crypto";
import type { Request, Response } from "express";

/**
 * CSRF Token management
 * Tokens are stored in memory and associated with sessions
 * In production, consider using Redis for better performance and scalability
 */

const csrfTokens = new Map<
  string,
  { token: string; expires: number; ip: string }
>();

const TOKEN_EXPIRY_MS = 1000 * 60 * 60; // 1 hour
const CLEANUP_INTERVAL_MS = 1000 * 60 * 30; // Clean up every 30 minutes

// Start cleanup interval
setInterval(() => {
  const now = Date.now();
  let deletedCount = 0;

  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(sessionId);
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    console.log(`🧹 Cleaned up ${deletedCount} expired CSRF tokens`);
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Generate a new CSRF token for a session
 */
export function generateCsrfToken(
  sessionId: string,
  ip: string = "unknown"
): string {
  const token = randomBytes(32).toString("hex");
  const expires = Date.now() + TOKEN_EXPIRY_MS;

  csrfTokens.set(sessionId, { token, expires, ip });
  return token;
}

/**
 * Validate a CSRF token against a session
 */
export function validateCsrfToken(
  sessionId: string,
  token: string,
  ip: string = "unknown"
): boolean {
  const storedData = csrfTokens.get(sessionId);

  if (!storedData) {
    console.warn(`❌ CSRF: No token found for session ${sessionId}`);
    return false;
  }

  // Check expiry
  if (Date.now() > storedData.expires) {
    console.warn(`❌ CSRF: Token expired for session ${sessionId}`);
    csrfTokens.delete(sessionId);
    return false;
  }

  // Verify token matches
  if (storedData.token !== token) {
    console.warn(
      `❌ CSRF: Token mismatch for session ${sessionId} from IP ${ip}`
    );
    return false;
  }

  // Optional: Verify IP hasn't changed (stricter security)
  // if (storedData.ip !== ip) {
  //   console.warn(`❌ CSRF: IP mismatch for session ${sessionId}`);
  //   return false;
  // }

  return true;
}

/**
 * Clear CSRF token for a session (on logout)
 */
export function clearCsrfToken(sessionId: string): void {
  csrfTokens.delete(sessionId);
}

/**
 * Get CSRF token from request or generate new one
 * This is used in context creation to always have a token available
 */
export function getCsrfToken(
  req: Request,
  sessionId: string,
  ip: string
): string {
  // Check if token is already stored for this session
  const existing = csrfTokens.get(sessionId);
  if (existing && Date.now() <= existing.expires) {
    return existing.token;
  }

  // Generate new token
  return generateCsrfToken(sessionId, ip);
}

/**
 * Express middleware to check CSRF token on mutations
 * Should be applied only to POST/PUT/DELETE requests
 */
export function csrfProtectionMiddleware(
  req: Request,
  res: Response,
  next: () => void
) {
  // Skip CSRF check for GET requests and health checks
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }

  // DEV MODE: Skip CSRF check if DEV_SKIP_AUTH is enabled
  if (process.env.DEV_SKIP_AUTH === 'true') {
    console.warn("[DEV MODE] ⚠️  CSRF protection bypassed!");
    return next();
  }

  // Get session ID from cookies or use IP as fallback
  const sessionId = req.cookies?.sessionId || req.ip || "anonymous";

  // Get CSRF token from header or body
  const csrfToken = req.headers["x-csrf-token"] || req.body?.csrfToken;
  
  // Enhanced logging for debugging
  console.log("[CSRF Middleware]", {
    method: req.method,
    path: req.path,
    url: req.originalUrl,
    sessionId: sessionId?.substring(0, 10),
    hasHeaderToken: !!req.headers["x-csrf-token"],
    headerToken: req.headers["x-csrf-token"] ? req.headers["x-csrf-token"].toString().substring(0, 10) : "none",
    hasBodyToken: !!req.body?.csrfToken,
    cookieNames: Object.keys(req.cookies || {}),
    headers: Object.keys(req.headers),
  });

  if (!csrfToken) {
    console.warn("❌ CSRF: No token provided", {
      sessionId,
      cookies: req.cookies,
    });
    // Return TRPC-compliant error
    return res.status(403).json({
      error: {
        message: "CSRF token missing",
        code: -32003, // FORBIDDEN
        data: { httpStatus: 403, code: "FORBIDDEN" }
      }
    });
  }

  // Get client IP
  const ip = (req.ip || req.headers["x-forwarded-for"] || "unknown") as string;

  // Validate token
  const isValid = validateCsrfToken(sessionId, csrfToken as string, ip);
  if (!isValid) {
    console.warn("❌ CSRF: Token validation failed", {
      sessionId,
      tokenProvided: csrfToken.toString().substring(0, 10),
    });
    // Return TRPC-compliant error
    return res.status(403).json({
      error: {
        message: "CSRF validation failed",
        code: -32003, // FORBIDDEN
        data: { httpStatus: 403, code: "FORBIDDEN" }
      }
    });
  }

  console.log("✅ CSRF: Token validated successfully");
  return next();
}
