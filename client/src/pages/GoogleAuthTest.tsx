import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { useAuth } from "@/hooks/useAuth";

export default function GoogleAuthTest() {
  const { user, isAuthenticated, isLoading } = useAuth() as any;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Google Authentication Test</h1>
        
        <div className="bg-card p-8 rounded-lg border">
          <div className="text-center mb-8">
            <GoogleAuthButton 
              isAuthenticated={isAuthenticated}
              className="w-full max-w-sm mx-auto"
            />
          </div>

          {isAuthenticated && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Authentication Status</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded border">
                  <h3 className="font-semibold mb-2">Authentication Status</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                    <p><strong>Auth Method:</strong> {user?.email ? 'Google' : 'Temp Admin'}</p>
                  </div>
                </div>

                <div className="bg-background p-4 rounded border">
                  <h3 className="font-semibold mb-2">Database User</h3>
                  {user ? (
                    <div className="space-y-2 text-sm">
                      <p><strong>ID:</strong> {(user as any).id}</p>
                      <p><strong>Email:</strong> {(user as any).email}</p>
                      <p><strong>Name:</strong> {(user as any).firstName} {(user as any).lastName}</p>
                      <p><strong>Role:</strong> {(user as any).role}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No database user</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="text-center text-muted-foreground">
              <p>Please sign in with Google to test authentication</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}