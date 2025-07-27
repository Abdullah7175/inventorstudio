import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, Palette, Layout, Target, RefreshCw } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import LoadingSkeleton from "./LoadingSkeleton";

interface DesignRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'color' | 'layout' | 'typography' | 'user-experience' | 'branding';
  confidence: number;
  reasoning: string;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIDesignRecommendationsProps {
  projectId: number;
  projectType?: string;
  targetAudience?: string;
  brandGuidelines?: string;
}

export default function AIDesignRecommendations({ 
  projectId, 
  projectType = 'website',
  targetAudience = 'general',
  brandGuidelines = ''
}: AIDesignRecommendationsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/ai/design-recommendations', projectId],
    enabled: !!projectId
  });

  const generateRecommendations = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      return await apiRequest(`/api/ai/design-recommendations`, {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          projectType,
          targetAudience,
          brandGuidelines,
          userId: user?.id
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/design-recommendations', projectId] });
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'color': return <Palette className="w-4 h-4" />;
      case 'layout': return <Layout className="w-4 h-4" />;
      case 'typography': return <Target className="w-4 h-4" />;
      case 'user-experience': return <Sparkles className="w-4 h-4" />;
      case 'branding': return <Lightbulb className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-lime-400" />
            AI Design Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton count={3} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-lime-400" />
            AI Design Recommendations
          </CardTitle>
          <Button
            onClick={() => generateRecommendations.mutate()}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className="border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate New'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!recommendations || recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No recommendations yet</p>
            <Button
              onClick={() => generateRecommendations.mutate()}
              disabled={isGenerating}
              className="bg-lime-400 text-black hover:bg-lime-500"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate AI Recommendations
            </Button>
          </div>
        ) : (
          recommendations.map((rec: DesignRecommendation) => (
            <div
              key={rec.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(rec.category)}
                  <h3 className="font-semibold text-lg">{rec.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${getPriorityColor(rec.priority)} text-white`}
                  >
                    {rec.priority.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {Math.round(rec.confidence * 100)}% confidence
                  </Badge>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                {rec.description}
              </p>
              
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-sm text-lime-600 dark:text-lime-400">
                    Why this matters:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {rec.reasoning}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-lime-600 dark:text-lime-400">
                    Implementation:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {rec.implementation}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <Badge variant="secondary" className="text-xs">
                  {rec.category.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}