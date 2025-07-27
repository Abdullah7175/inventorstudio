import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Target,
  Zap
} from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProjectHealth {
  overall: number; // 0-100
  timeline: {
    score: number;
    status: 'on-track' | 'at-risk' | 'delayed';
    daysRemaining: number;
    completionPercentage: number;
  };
  budget: {
    score: number;
    status: 'under-budget' | 'on-budget' | 'over-budget';
    spent: number;
    allocated: number;
    remaining: number;
  };
  team: {
    score: number;
    status: 'efficient' | 'adequate' | 'struggling';
    productivity: number;
    availability: number;
    workload: number;
  };
  quality: {
    score: number;
    status: 'excellent' | 'good' | 'needs-improvement';
    issuesCount: number;
    testCoverage: number;
    clientSatisfaction: number;
  };
  communication: {
    score: number;
    status: 'active' | 'moderate' | 'poor';
    responseTime: number;
    clientEngagement: number;
    lastUpdate: string;
  };
  risks: Array<{
    id: string;
    type: 'timeline' | 'budget' | 'quality' | 'team' | 'external';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    mitigation: string;
  }>;
  recommendations: Array<{
    id: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    expectedImpact: string;
  }>;
}

interface ProjectHealthIndicatorProps {
  projectId: number;
  compact?: boolean;
}

export default function ProjectHealthIndicator({ projectId, compact = false }: ProjectHealthIndicatorProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const { data: health, isLoading } = useQuery({
    queryKey: ['/api/projects/health', projectId],
    enabled: !!projectId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
      case 'under-budget':
      case 'efficient':
      case 'excellent':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'at-risk':
      case 'on-budget':
      case 'adequate':
      case 'good':
      case 'moderate':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'delayed':
      case 'over-budget':
      case 'struggling':
      case 'needs-improvement':
      case 'poor':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-lime-400" />
            Project Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-lime-400" />
            Project Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No health data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-lime-400" />
              <span className="font-medium">Project Health</span>
            </div>
            <div className={`text-2xl font-bold ${getHealthColor(health.overall)}`}>
              {health.overall}%
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{health.overall}%</span>
            </div>
            <Progress 
              value={health.overall} 
              className="h-2"
            />
          </div>
          
          {health.risks && health.risks.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Active Risks</span>
              </div>
              <div className="space-y-1">
                {health.risks.slice(0, 2).map((risk) => (
                  <div key={risk.id} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getRiskColor(risk.severity)}`} />
                    <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      {risk.description}
                    </span>
                  </div>
                ))}
                {health.risks.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{health.risks.length - 2} more risks
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-lime-400" />
              Project Health Score
            </div>
            <div className={`text-3xl font-bold ${getHealthColor(health.overall)}`}>
              {health.overall}%
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress 
            value={health.overall} 
            className="h-4 mb-4"
          />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Timeline */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getStatusIcon(health.timeline.status)}
                <Calendar className="w-4 h-4" />
              </div>
              <div className={`text-xl font-bold ${getHealthColor(health.timeline.score)}`}>
                {health.timeline.score}%
              </div>
              <div className="text-sm text-gray-500">Timeline</div>
              <div className="text-xs text-gray-400">
                {health.timeline.daysRemaining} days left
              </div>
            </div>

            {/* Budget */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getStatusIcon(health.budget.status)}
                <DollarSign className="w-4 h-4" />
              </div>
              <div className={`text-xl font-bold ${getHealthColor(health.budget.score)}`}>
                {health.budget.score}%
              </div>
              <div className="text-sm text-gray-500">Budget</div>
              <div className="text-xs text-gray-400">
                ${health.budget.remaining.toLocaleString()} left
              </div>
            </div>

            {/* Team */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getStatusIcon(health.team.status)}
                <Users className="w-4 h-4" />
              </div>
              <div className={`text-xl font-bold ${getHealthColor(health.team.score)}`}>
                {health.team.score}%
              </div>
              <div className="text-sm text-gray-500">Team</div>
              <div className="text-xs text-gray-400">
                {health.team.productivity}% productive
              </div>
            </div>

            {/* Quality */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getStatusIcon(health.quality.status)}
                <Target className="w-4 h-4" />
              </div>
              <div className={`text-xl font-bold ${getHealthColor(health.quality.score)}`}>
                {health.quality.score}%
              </div>
              <div className="text-sm text-gray-500">Quality</div>
              <div className="text-xs text-gray-400">
                {health.quality.issuesCount} issues
              </div>
            </div>

            {/* Communication */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getStatusIcon(health.communication.status)}
                <Zap className="w-4 h-4" />
              </div>
              <div className={`text-xl font-bold ${getHealthColor(health.communication.score)}`}>
                {health.communication.score}%
              </div>
              <div className="text-sm text-gray-500">Communication</div>
              <div className="text-xs text-gray-400">
                {health.communication.responseTime}h response
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risks and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Risks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Active Risks
              {health.risks && health.risks.length > 0 && (
                <Badge variant="secondary" className="bg-orange-500 text-white">
                  {health.risks.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {health.risks && health.risks.length > 0 ? (
              <div className="space-y-4">
                {health.risks.map((risk) => (
                  <div key={risk.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getRiskColor(risk.severity)}`} />
                        <span className="font-medium">{risk.type.charAt(0).toUpperCase() + risk.type.slice(1)} Risk</span>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={`${getRiskColor(risk.severity)} text-white text-xs`}
                      >
                        {risk.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{risk.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div><strong>Impact:</strong> {risk.impact}</div>
                      <div><strong>Mitigation:</strong> {risk.mitigation}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No active risks detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Recommendations
              {health.recommendations && health.recommendations.length > 0 && (
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  {health.recommendations.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {health.recommendations && health.recommendations.length > 0 ? (
              <div className="space-y-4">
                {health.recommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium">{rec.category}</span>
                      <Badge 
                        variant="secondary"
                        className={`${
                          rec.priority === 'high' ? 'bg-red-500' :
                          rec.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        } text-white text-xs`}
                      >
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{rec.action}</p>
                    <div className="text-xs text-gray-500">
                      <strong>Expected Impact:</strong> {rec.expectedImpact}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">All systems optimal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}