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

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
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
