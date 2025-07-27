import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Sparkles, 
  Heart, 
  Eye, 
  Bookmark, 
  RefreshCw, 
  ExternalLink,
  Star,
  Clock,
  DollarSign
} from "lucide-react";

interface DesignTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  styleType: string;
  industry: string;
  colorSchemes: string[];
  features: string[];
  imageUrl?: string;
  previewUrl?: string;
  difficulty: string;
  estimatedHours: number;
  price: string;
}

interface Recommendation {
  id: number;
  templateId: number;
  score: number;
  reason: string;
  viewed: boolean;
  liked: boolean;
  template?: DesignTemplate;
}

export default function RecommendationsDisplay() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ["/api/recommendations"],
    retry: false,
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/design-templates"],
    retry: false,
  });

  const generateRecommendations = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/recommendations/generate", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to generate recommendations");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recommendations Updated",
        description: "New recommendations generated based on your preferences.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const recordInteraction = useMutation({
    mutationFn: async ({ templateId, action, data }: { 
      templateId?: number; 
      projectId?: number; 
      action: string; 
      data?: any 
    }) => {
      const response = await fetch("/api/recommendations/interact", {
        method: "POST",
        body: JSON.stringify({ templateId, action, data }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to record interaction");
      return response.json();
    },
  });

  const handleInteraction = (templateId: number, action: string, data?: any) => {
    recordInteraction.mutate({ templateId, action, data });
  };

  const toggleExpanded = (id: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getTemplateDetails = (templateId: number): DesignTemplate | undefined => {
    return Array.isArray(templates) ? templates.find((t: DesignTemplate) => t.id === templateId) : undefined;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "🟢";
      case "medium": return "🟡";
      case "hard": return "🔴";
      default: return "⚪";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Set up your design preferences to get personalized recommendations.
          </p>
          <Button onClick={() => generateRecommendations.mutate()}>
            Generate Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete your design preferences to get personalized recommendations.
          </p>
          <Button 
            onClick={() => generateRecommendations.mutate()}
            disabled={generateRecommendations.isPending}
          >
            {generateRecommendations.isPending ? "Generating..." : "Generate Recommendations"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Your Recommendations
          </h2>
          <p className="text-muted-foreground">
            Personalized design suggestions based on your preferences
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => generateRecommendations.mutate()}
          disabled={generateRecommendations.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${generateRecommendations.isPending ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {Array.isArray(recommendations) && recommendations.map((rec: Recommendation) => {
          const template = getTemplateDetails(rec.templateId);
          if (!template) return null;

          const isExpanded = expandedCards.has(rec.id);

          return (
            <Card key={rec.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      <Badge className={getScoreColor(rec.score)}>
                        {rec.score}% match
                      </Badge>
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleInteraction(template.id, 'view');
                        toggleExpanded(rec.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInteraction(template.id, 'like')}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInteraction(template.id, 'save')}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recommendation reason */}
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Why this matches:</strong> {rec.reason}
                    </p>
                  </div>

                  {/* Template details */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{template.category}</Badge>
                    <Badge variant="outline">{template.styleType}</Badge>
                    <Badge variant="outline">{template.industry}</Badge>
                    <Badge variant="outline">
                      {getDifficultyIcon(template.difficulty)} {template.difficulty}
                    </Badge>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{template.estimatedHours} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{template.price} pricing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{template.difficulty} complexity</span>
                        </div>
                      </div>

                      {template.features && template.features.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Included Features:</h4>
                          <div className="flex flex-wrap gap-1">
                            {template.features.map((feature: string) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {template.colorSchemes && template.colorSchemes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Color Schemes:</h4>
                          <div className="flex flex-wrap gap-1">
                            {template.colorSchemes.map((scheme: string) => (
                              <Badge key={scheme} variant="outline" className="text-xs">
                                {scheme}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        {template.previewUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={template.previewUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Preview
                            </a>
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          onClick={() => handleInteraction(template.id, 'request_quote')}
                        >
                          Request Quote
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}