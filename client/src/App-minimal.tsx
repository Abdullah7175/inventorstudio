import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Minimal imports - only what's absolutely necessary
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <main>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/" component={Landing} />
              <Route>
                <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
                    <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
                  </div>
                </div>
              </Route>
            </Switch>
          </main>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
