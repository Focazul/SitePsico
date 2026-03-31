const BASE_URL =
  process.env.FRONTEND_URL ||
  process.env.VITE_APP_URL ||
  process.env.VITE_FRONTEND_URL ||
  "";

function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function isPublishableDate(date: Date | null | undefined): boolean {
  if (!date) return false;
  return date.getTime() <= Date.now();
}

async function safeFetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new globalThis.AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "SitePsicoBot/1.0",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function notifySearchConsoleOnPublish(publishedAt: Date | null | undefined): Promise<void> {
  // Safe by default: disabled unless explicitly enabled in environment.
  if (process.env.ENABLE_GSC_PING !== "true") return;
  if (!isPublishableDate(publishedAt)) return;
  if (!BASE_URL || !isValidHttpsUrl(BASE_URL)) {
    console.warn("[SEO] GSC ping skipped: invalid or non-HTTPS BASE_URL");
    return;
  }

  const sitemapUrl = `${BASE_URL.replace(/\/$/, "")}/sitemap.xml`;
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

  try {
    const response = await safeFetchWithTimeout(pingUrl, 5000);
    if (!response.ok) {
      console.warn("[SEO] Google ping returned non-OK status", { status: response.status });
    }
  } catch (error) {
    console.warn("[SEO] Google ping failed", error);
  }
}
