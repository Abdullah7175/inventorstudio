import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, LogIn } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface GoogleAuthButtonProps {
  isAuthenticated: boolean;
  className?: string;
}

export function GoogleAuthButton({ isAuthenticated, className }: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: "Success",
        description: "Successfully signed in with Google",
      });
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Sign-in Failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    
    toast({
      title: "Signing Out",
      description: "Clearing authentication...",
    });
    
    try {
      // Clear all authentication tokens first
      (window as any).__authToken = null;
      
      // Clear Firebase auth state
      await signOut(auth);
      
      // Clear server-side sessions
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      
      // Clear all cached data
      queryClient.clear();
      
      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies by setting expired date
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      // Force complete page reload to clear all state
      window.location.replace("/");
      
    } catch (error: any) {
      console.error("Sign-out error:", error);
      // Force reload even if logout partially failed
      window.location.replace("/");
    }
  };

  if (isAuthenticated) {
    return (
      <Button
        onClick={handleSignOut}
        disabled={loading}
        variant="outline"
        className={className}
      >
        <LogOut className="w-4 h-4 mr-2" />
        {loading ? "Signing out..." : "Sign Out"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      className={className}
    >
      <LogIn className="w-4 h-4 mr-2" />
      {loading ? "Signing in..." : "Sign in with Google"}
    </Button>
  );
}