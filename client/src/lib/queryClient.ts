import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      ...((options.body && !(options.body instanceof FormData)) ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: options.body,
    credentials: "include",
    ...options,
  });

  // Handle 401 errors by redirecting to login (not home)
  if (res.status === 401) {
    // Don't redirect if user just logged out or we're already on login page
    const userLoggedOut = sessionStorage.getItem('userLoggedOut');
    const isOnLoginPage = window.location.pathname === '/login';
    
    if (!userLoggedOut && !isOnLoginPage) {
      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();
      // Redirect to login page
      window.location.href = "/login";
    }
    throw new Error("401: Unauthorized - Please sign in");
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle queryKey properly - only join string parts
    const url = queryKey.filter(key => typeof key === 'string').join('/');
    
    const res = await fetch(url, {
      credentials: "include",
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
