import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setFirebaseLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get user data from our backend when Firebase user exists
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    enabled: !!firebaseUser, // Only fetch when Firebase user exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Check temp admin access when no Firebase user
  const { data: tempUser, isLoading: tempLoading } = useQuery({
    queryKey: ["/api/auth/temp-user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    enabled: !firebaseUser && !firebaseLoading, // Only check temp access when no Firebase user
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const finalUser = user || tempUser;
  const isLoading = firebaseLoading || userLoading || tempLoading;

  return {
    user: finalUser,
    firebaseUser,
    isLoading,
    isAuthenticated: !!finalUser,
  };
}
