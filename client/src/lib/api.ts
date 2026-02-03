export function getApiBaseUrl(): string {
  // In production on Render, ALWAYS use relative URLs
  // This ensures frontend and backend on same origin communicate properly
  // without needing VITE_API_URL environment variable
  
  if (typeof window === "undefined") return "";

  // Development environment check
  const isDev = window.location.hostname === "localhost" || 
                window.location.hostname === "127.0.0.1";

  if (!isDev) {
    // Production: always use relative URL (same origin)
    // Avoids CORS/CSP issues when frontend and backend are co-located
    return "";
  }

  // Development: try to use VITE_API_URL if available
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl;
  }

  // Default to relative URL
  return "";
}
