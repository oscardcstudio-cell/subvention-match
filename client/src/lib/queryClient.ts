import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Construit les headers d'une requête vers l'API.
 * - Pour les routes admin, injecte automatiquement `x-admin-token` à partir de
 *   la query string `?admin_token=...` (convention déjà acceptée côté serveur).
 *   Ça évite que les composants doivent gérer l'auth à la main, et ça empêche
 *   les fuites dans les logs serveur (header au lieu de query).
 */
function buildHeaders(url: string, extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {};
  if (extra) Object.assign(headers, extra);

  if (url.startsWith("/api/admin/") && typeof window !== "undefined") {
    const token = new URLSearchParams(window.location.search).get("admin_token");
    if (token) headers["x-admin-token"] = token;
  }

  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: buildHeaders(url, data ? { "Content-Type": "application/json" } : undefined),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const res = await fetch(url, {
      credentials: "include",
      headers: buildHeaders(url),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
