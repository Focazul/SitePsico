export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  // Usar env apenas se for uma URL absoluta
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl;
  }

  // Default to relative URL for same-origin deployment (both dev and prod)
  // This ensures the frontend talks to the backend serving it
  return "";
}
