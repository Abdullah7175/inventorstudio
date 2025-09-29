import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { registerUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { refetch } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      setSuccess(true);
      await refetch(); // Refresh user data

      // Redirect to client portal after successful registration
      setTimeout(() => {
        window.location.href = "/client-portal";
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center" style={{ backgroundColor: '#000000' }}>
        {/* Header */}
        <div className="w-full bg-black/20 backdrop-blur-sm border-b border-white/10 absolute top-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">IDS</span>
                </div>
                <span className="text-white font-bold text-lg">Inventor Design Studio</span>
              </Link>
              <Link href="/login">
                <Button className="bg-primary text-black hover:bg-primary/80 transition-all duration-300 group">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-md w-full space-y-8 text-center">
          <Card className="bg-black/40 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-green-500 text-2xl">Registration Successful!</CardTitle>
              <CardDescription className="text-gray-300">
                Your account has been created successfully. Redirecting to your dashboard...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

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
            <Link href="/login">
              <Button className="bg-primary text-black hover:bg-primary/80 transition-all duration-300 group">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sign In
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
              Create your account
            </h2>
            <p className="text-primary">
              Or{" "}
              <Link href="/login" className="underline hover:text-primary/80">
                sign in to your existing account
              </Link>
            </p>
          </div>

          <Card className="bg-black/40 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">Register</CardTitle>
              <CardDescription className="text-gray-300">
                Create a new account to access our services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                    <AlertDescription className="text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      {...register("firstName")}
                      className={`bg-black/20 border-white/30 text-white placeholder:text-gray-400 ${errors.firstName ? "border-red-500" : ""}`}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-400">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      {...register("lastName")}
                      className={`bg-black/20 border-white/30 text-white placeholder:text-gray-400 ${errors.lastName ? "border-red-500" : ""}`}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-400">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

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
                  <Label htmlFor="phone" className="text-white">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    {...register("phone")}
                    className="bg-black/20 border-white/30 text-white placeholder:text-gray-400"
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...register("confirmPassword")}
                      className={`bg-black/20 border-white/30 text-white placeholder:text-gray-400 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
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