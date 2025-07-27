import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PreferencesForm from "@/components/PreferencesForm";
import RecommendationsDisplay from "@/components/RecommendationsDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Settings, Lightbulb } from "lucide-react";

export default function Recommendations() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("recommendations");

  const { data: preferences } = useQuery({
    queryKey: ["/api/recommendations/preferences"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Design Recommendations</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to access personalized design recommendations based on your preferences and project needs.
            </p>
            <a 
              href="/api/login"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Sign In to Continue
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has no preferences, show the setup flow
  if (!preferences && activeTab === "recommendations") {
    setActiveTab("preferences");
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          Design Recommendations
        </h1>
        <p className="text-xl text-muted-foreground">
          Get personalized design suggestions tailored to your project needs and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationsDisplay />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesForm />
        </TabsContent>
      </Tabs>

      {/* Popular Templates Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Popular Design Templates</h2>
        <PopularTemplates />
      </div>
    </div>
  );
}

function PopularTemplates() {
  const { data: popularTemplates, isLoading } = useQuery({
    queryKey: ["/api/design-templates/popular"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!popularTemplates || !Array.isArray(popularTemplates) || popularTemplates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No popular templates available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.isArray(popularTemplates) && popularTemplates.map((template: any) => (
        <Card key={template.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {template.category}
                </span>
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                  {template.styleType}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {template.estimatedHours} hours • {template.difficulty} difficulty
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}