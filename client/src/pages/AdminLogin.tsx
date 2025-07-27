import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowRight, User, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  useEffect(() => {
    // Clear any existing session data
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  const handleAdminLogin = () => {
    // Redirect to login with admin context
    window.location.href = "/api/login?role=admin";
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
              <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
              <p className="text-muted-foreground mt-2">
                Access the administrative dashboard
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Admin Email</p>
                  <p className="text-sm text-muted-foreground">ebadm7251@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <User className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Access Level</p>
                  <p className="text-sm text-muted-foreground">Administrator</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAdminLogin}
              className="w-full bg-primary text-black hover:bg-primary/80 transition-all duration-300 group"
              size="lg"
            >
              Login as Admin
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Need help accessing your account?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/contact"}
              >
                Contact Support
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground text-center">
                This login uses Replit authentication. Make sure you're logged into
                Replit with the email: <strong>ebadm7251@gmail.com</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}