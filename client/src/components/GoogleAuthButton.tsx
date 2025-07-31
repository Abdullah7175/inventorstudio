import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, LogIn } from "lucide-react";

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
    try {
      await signOut(auth);
      // Also clear any temp admin session
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      
      toast({
        title: "Signed Out",
        description: "Successfully signed out",
      });
      
      // Force page reload to clear all cached data
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast({
        title: "Sign-out Failed",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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