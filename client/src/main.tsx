import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
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

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/trpc` : "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        console.log("[tRPC Client] Fetching:", input);
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        }).then(async (response) => {
          console.log("[tRPC Client] Response status:", response.status, response.statusText);
          if (!response.ok) {
            // Clone the response to read body without consuming it
            const clonedResponse = response.clone();
            console.error("[tRPC] Error response:", response.status, response.statusText);
            try {
              const text = await clonedResponse.text();
              console.error("[tRPC] Response body:", text);
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
