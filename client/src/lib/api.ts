export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl && envUrl.trim().length > 0) return envUrl;

  if (import.meta.env.PROD) {
    // Fallback seguro em produção quando a env não está configurada
    return "https://backend-production-4a6b.up.railway.app";
  }
  // Dev: usa proxy local
  return ""; // relativo: /api/trpc
}
