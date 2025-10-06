import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { loginUser, type AuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, LogIn, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetch, user, isAuthenticated } = useAuth();
  const hasRedirected = useRef(false); // Prevent infinite redirects

  // Auto-redirect if user is already logged in (but not if they just logged out)
  useEffect(() => {
    console.log('Login useEffect triggered:', { 
      isAuthenticated, 
      user: !!user, 
      isLoading,
      hasRedirected: hasRedirected.current,
      userRole: (user as AuthUser | null)?.role,
      userId: (user as AuthUser | null)?.id 
    });
    
    // Prevent infinite redirects
    if (hasRedirected.current) {
      console.log('🚫 Redirect already attempted, skipping');
      return;
    }
    
    // Enhanced logout detection - check multiple flags
    const userJustLoggedOut = sessionStorage.getItem('userLoggedOut');
    const logoutInProgress = sessionStorage.getItem('logoutInProgress');
    const recentLogin = sessionStorage.getItem('recentLogin');
    
    console.log('Login state flags:', { userJustLoggedOut, logoutInProgress, recentLogin });
    
    // CRITICAL: If user just logged out or logout is in progress, NEVER auto-redirect
    if (userJustLoggedOut === 'true' || logoutInProgress === 'true') {
      console.log('🚫 Preventing auto-redirect: User just logged out or logout in progress');
      
      // Clear logout flags but stay on login page
      sessionStorage.removeItem('userLoggedOut');
      sessionStorage.removeItem('logoutInProgress');
      
      console.log('✅ Logout flags cleared, staying on login page');
      return;
    }

    // Only proceed with auto-redirect if user is authenticated AND it's not a post-logout visit
    const typedUser = user as AuthUser | null;
    if (isAuthenticated && typedUser && typedUser.id && typedUser.role && !isLoading) {
      console.log('✅ User is authenticated, auto-redirecting to portal:', { role: typedUser.role, teamRole: typedUser.teamRole });
      
      hasRedirected.current = true; // Mark that we've attempted a redirect
      
      const userRole = typedUser.role;
      const teamRole = typedUser.teamRole;
      const isSEOExpert = teamRole === 'SEO Expert';
      
      if (userRole === 'admin') {
        window.location.href = "/admin";
      } else if (userRole === 'seo' || isSEOExpert) {
        window.location.href = "/seo";
      } else if (userRole === 'team') {
        window.location.href = "/team";
      } else if (userRole === 'customer' || userRole === 'client') {
        window.location.href = "/client-portal";
      } else {
        window.location.href = "/";
      }
    } else {
      console.log('❌ User not authenticated or missing data:', { 
        isAuthenticated, 
        hasUser: !!typedUser, 
        userId: typedUser?.id, 
        role: typedUser?.role,
        isLoading
      });
    }
  }, [isAuthenticated, user, isLoading]);

  // Clear logout flag once server confirms user is not authenticated
  useEffect(() => {
    if (!isLoading && !user && !isAuthenticated) {
      // Server confirms user is not authenticated - clear the "just logged out" guard
      console.log('Server confirms user is not authenticated - clearing logout flags');
      sessionStorage.removeItem('userLoggedOut');
      sessionStorage.removeItem('logoutInProgress');
    }
  }, [isLoading, user, isAuthenticated]);

  // Additional safety check: Clear logout flags after a delay to prevent them from persisting too long
  useEffect(() => {
    const timeout = setTimeout(() => {
      const userJustLoggedOut = sessionStorage.getItem('userLoggedOut');
      const logoutInProgress = sessionStorage.getItem('logoutInProgress');
      
      if (userJustLoggedOut === 'true' || logoutInProgress === 'true') {
        console.log('🕐 Clearing logout flags after timeout (safety measure)');
        sessionStorage.removeItem('userLoggedOut');
        sessionStorage.removeItem('logoutInProgress');
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timeout);
  }, []);

  // Clear recent login flag after 10 seconds as a safety measure
  useEffect(() => {
    const timeout = setTimeout(() => {
      const recentLogin = sessionStorage.getItem('recentLogin');
      if (recentLogin === 'true') {
        console.log('Clearing recent login flag after timeout');
        sessionStorage.removeItem('recentLogin');
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timeout);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting login process...');
      const response = await loginUser(data);
      
      console.log('Login successful, response:', response);
      console.log('User role from response:', response.user?.role);
      
      // Clear any logout flags since user is now successfully logged in
      sessionStorage.removeItem('userLoggedOut');
      sessionStorage.removeItem('logoutInProgress');
      
      // Reset redirect flag for successful login
      hasRedirected.current = false;
      
      // Set recent login flag to allow redirect
      sessionStorage.setItem('recentLogin', 'true');
      
      console.log('About to call refetch...');
      // Wait for user data to be refreshed
      await refetch();
      console.log('Refetch completed');
      
      // Force redirect immediately - don't rely on useEffect
      const userRole = response.user?.role;
      const teamRole = response.user?.teamRole;
      console.log('About to redirect to:', { userRole, teamRole });
      
      // Check if team member has SEO Expert role for SEO portal access
      const isSEOExpert = teamRole === 'SEO Expert';
      
      // Use href instead of replace to test
      if (userRole === 'admin') {
        console.log('Redirecting to admin portal');
        window.location.href = "/admin";
      } else if (userRole === 'seo' || isSEOExpert) {
        console.log('Redirecting to SEO portal');
        window.location.href = "/seo";
      } else if (userRole === 'team') {
        console.log('Redirecting to team portal');
        window.location.href = "/team";
      } else if (userRole === 'customer' || userRole === 'client') {
        console.log('Redirecting to client portal');
        window.location.href = "/client-portal";
      } else {
        console.log('Redirecting to home (default)');
        window.location.href = "/";
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col" style={{ backgroundColor: '#000000' }}>
      {/* Header */}
      <div className="w-full bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">IDS</span>
              </div>
              <span className="text-white font-bold text-lg">Inventor Design Studio</span>
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-black hover:bg-primary/80 transition-all duration-300 group">
                <ArrowRight className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-2">
              Sign in to your account
            </h2>
            <p className="text-primary">
              Or{" "}
              <Link href="/register" className="underline hover:text-primary/80">
                create a new account
              </Link>
            </p>
          </div>

          <Card className="bg-black/40 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">Login</CardTitle>
              <CardDescription className="text-gray-300">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                    <AlertDescription className="text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className={`bg-black/20 border-white/30 text-white placeholder:text-gray-400 ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      className={`bg-black/20 border-white/30 text-white placeholder:text-gray-400 ${errors.password ? "border-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-black hover:bg-primary/80 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
