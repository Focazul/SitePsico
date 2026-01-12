import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getApiBaseUrl } from "./lib/api";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

// CSRF Token Cache
let csrfToken: string | null = null;

/**
 * Get CSRF token from server
 * Caches the token to avoid repeated requests
 */
async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  try {
    const base = getApiBaseUrl();
    const url = base ? `${base}/api/csrf-token` : "/api/csrf-token";
    
    const response = await fetch(url, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to get CSRF token: ${response.status}`);
    }

    const data = await response.json();
    csrfToken = data.token;
    console.log("[CSRF] Token obtained successfully");
    return csrfToken;
  } catch (error) {
    console.error("[CSRF] Error getting token:", error);
    // Return empty string to allow request to proceed (backend will reject it)
    return "";
  }
}

const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: (() => {
        const base = getApiBaseUrl();
        return base ? `${base}/api/trpc` : "/api/trpc";
      })(),
      async fetch(input, init) {
        console.log("[tRPC Client] Fetching:", input);
        
        // Get CSRF token for POST requests
        const token = await getCsrfToken();
        console.log("[tRPC Client] CSRF token included:", token ? `${token.substring(0, 10)}...` : "EMPTY!");
        
        const headers = {
          ...(init?.headers ?? {}),
          "X-CSRF-Token": token,
        };
        
        const fetchInit = {
          credentials: "include" as const,
          ...(init ?? {}),
          headers,
        };
        
        console.log("[tRPC Client] Credentials:", fetchInit.credentials);
        console.log("[tRPC Client] Final headers:", Object.keys(headers));
        
        return globalThis.fetch(input, fetchInit).then(async (response) => {
          console.log("[tRPC Client] Response status:", response.status, response.statusText);
          
          // Clone para ler o corpo sem consumir
          const clonedResponse = response.clone();
          
          if (!response.ok) {
            console.error("[tRPC] Error response:", response.status, response.statusText);
            try {
              const text = await clonedResponse.text();
              console.error("[tRPC] Response body:", text);
              
              // Verificar se é JSON válido
              try {
                const json = JSON.parse(text);
                console.error("[tRPC] Parsed error:", json);
              } catch (parseError) {
                console.error("[tRPC] Response is not valid JSON:", parseError);
              }
            } catch (e) {
              console.error("[tRPC] Could not read response body:", e);
            }
          }
          
          return response;
        }).catch((error) => {
          console.error("[tRPC] Fetch error:", error);
          throw error;
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
