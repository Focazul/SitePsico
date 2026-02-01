import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getCsrfToken } from "./csrf";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  ip: string;
  csrfToken?: string;
  sessionId?: string;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  console.log('[Context] Creating context...');
  console.log('[Context] Request method:', opts.req.method);
  console.log('[Context] Request URL:', opts.req.url);
  console.log('[Context] Request headers:', Object.keys(opts.req.headers));
  console.log('[Context] Cookies:', opts.req.cookies);

  try {
    user = await sdk.authenticateRequest(opts.req);
    console.log('[Context] User authenticated:', user?.email, user?.role);
  } catch (error) {
    console.log('[Context] Authentication failed:', error instanceof Error ? error.message : String(error));
    // Authentication is optional for public procedures.
    user = null;
  }

  // Extract client IP
  const ip = 
    (opts.req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    opts.req.ip ||
    "unknown";

  // Get session ID from cookies
  const sessionId = opts.req.cookies?.sessionId || `session_${Date.now()}`;

  // Generate or retrieve CSRF token
  const csrfToken = getCsrfToken(opts.req, sessionId, ip);

  return {
    req: opts.req,
    res: opts.res,
    user,
    ip,
    csrfToken,
    sessionId,
  };
}
