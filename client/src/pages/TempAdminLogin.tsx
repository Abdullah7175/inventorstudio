import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TempAdminLogin() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest("/api/auth/temp-admin", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
      // Redirect to admin portal after successful login
      setTimeout(() => {
        window.location.href = "/admin-portal";
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the admin password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-black" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Quick Admin Access</CardTitle>
              <p className="text-muted-foreground mt-2">
                Simple login for development testing
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="pr-10"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-black hover:bg-primary/80 transition-all duration-300"
                size="lg"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Access Admin Panel
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Demo Credentials
              </h4>
              <p className="text-sm text-muted-foreground mb-1">
                <strong>Password:</strong> admin123
              </p>
              <p className="text-xs text-muted-foreground">
                This is a temporary login method for development and testing purposes.
              </p>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/"}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}