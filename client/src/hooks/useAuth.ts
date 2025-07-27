import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

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

  return {
    user: finalUser,
    isLoading,
    isAuthenticated: !!finalUser,
  };
}
