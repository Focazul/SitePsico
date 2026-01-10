export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  // Usar env apenas se for uma URL absoluta
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl;
  }

  if (import.meta.env.PROD) {
    // Fallback seguro em produção quando a env está ausente ou inválida
    return "https://backend-production-4a6b.up.railway.app";
  }
  // Dev: usa proxy local
  return ""; // relativo: /api/trpc
}
