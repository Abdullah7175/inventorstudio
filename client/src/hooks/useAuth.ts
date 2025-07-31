import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";

export function useAuth() {
  // Try regular auth first
  const { data: user, isLoading: regularLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Try temp admin auth if regular auth fails
  const { data: tempUser, isLoading: tempLoading } = useQuery({
    queryKey: ["/api/auth/temp-user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    enabled: !user && !regularLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const finalUser = user || tempUser;
  const isLoading = regularLoading || tempLoading;

  const logout = async () => {
    try {
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear React Query cache
      queryClient.clear();
      
      // Try both logout endpoints to handle both regular and temp admin sessions
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include"
        });
      } catch {
        // Fallback to the main logout endpoint
        await fetch("/api/logout", {
          method: "GET",
          credentials: "include"
        });
      }
      
      // Force page redirect to complete logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local state and redirect
      window.location.href = "/";
    }
  };

  return {
    user: finalUser,
    isLoading,
    isAuthenticated: !!finalUser,
    logout,
  };
}
