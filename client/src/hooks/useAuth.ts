import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { signOutUser } from "@/lib/firebase";

export function useAuth() {
  // Get user from backend (which validates JWT token)
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const logout = async () => {
    try {
      // Use Firebase sign out which also clears backend session
      await signOutUser();
      
      // Clear React Query cache
      queryClient.clear();
      
      // Force page redirect to complete logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if Firebase logout fails, clear local state and redirect
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
  };
}
