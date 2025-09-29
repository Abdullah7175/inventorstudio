import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { logoutUser } from "@/lib/auth";

export function useAuth() {
  // Get user from backend (which validates JWT token)
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const logout = async () => {
    try {
      // Use new logout function
      await logoutUser();
      
      // Clear React Query cache
      queryClient.clear();
      
      // Force page redirect to complete logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state and redirect
      localStorage.clear();
      sessionStorage.clear();
      queryClient.clear();
      window.location.href = "/";
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refetch,
  };
}
