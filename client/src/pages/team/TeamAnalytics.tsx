import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  productivity: {
    tasksCompleted: number;
    tasksInProgress: number;
    tasksOverdue: number;
    averageCompletionTime: number;
  };
  projects: {
    active: number;
    completed: number;
    onTime: number;
    delayed: number;
  };
  timeTracking: {
    totalHoursThisWeek: number;
    totalHoursThisMonth: number;
    averageDailyHours: number;
    mostProductiveDay: string;
  };
  performance: {
    efficiency: number;
    quality: number;
    collaboration: number;
    communication: number;
  };
}

interface TimeSeriesData {
  date: string;
  tasksCompleted: number;
  hoursWorked: number;
}

export default function TeamAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockAnalytics: AnalyticsData = {
      productivity: {
        tasksCompleted: 45,
        tasksInProgress: 12,
        tasksOverdue: 3,
        averageCompletionTime: 2.5
      },
      projects: {
        active: 5,
        completed: 18,
        onTime: 15,
        delayed: 3
      },
      timeTracking: {
        totalHoursThisWeek: 42,
        totalHoursThisMonth: 168,
        averageDailyHours: 8.4,
        mostProductiveDay: 'Tuesday'
      },
      performance: {
        efficiency: 87,
        quality: 92,
        collaboration: 89,
        communication: 85
      }
    };

    const mockTimeSeries: TimeSeriesData[] = [
      { date: '2025-01-01', tasksCompleted: 8, hoursWorked: 7.5 },
      { date: '2025-01-02', tasksCompleted: 12, hoursWorked: 8.0 },
      { date: '2025-01-03', tasksCompleted: 6, hoursWorked: 6.5 },
      { date: '2025-01-04', tasksCompleted: 15, hoursWorked: 9.0 },
      { date: '2025-01-05', tasksCompleted: 10, hoursWorked: 7.0 },
      { date: '2025-01-06', tasksCompleted: 9, hoursWorked: 7.5 },
      { date: '2025-01-07', tasksCompleted: 13, hoursWorked: 8.5 }
    ];

    setAnalyticsData(mockAnalytics);
    setTimeSeriesData(mockTimeSeries);
    setLoading(false);
  }, []);

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your performance and productivity metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.productivity.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.projects.active}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.projects.completed} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.timeTracking.totalHoursThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Avg. {analyticsData?.timeTracking.averageDailyHours}h per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            {getPerformanceIcon(analyticsData?.performance.efficiency || 0)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(analyticsData?.performance.efficiency || 0)}`}>
              {analyticsData?.performance.efficiency}%
            </div>
            <p className="text-xs text-muted-foreground">
              Above team average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Productivity Overview</CardTitle>
            <CardDescription>Your task completion and project status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Tasks Completed</span>
                </div>
                <span className="font-medium">{analyticsData?.productivity.tasksCompleted}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="font-medium">{analyticsData?.productivity.tasksInProgress}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Overdue</span>
                </div>
                <span className="font-medium">{analyticsData?.productivity.tasksOverdue}</span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Average Completion Time</span>
                  <span className="text-sm font-medium">{analyticsData?.productivity.averageCompletionTime} days</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Your key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData?.performance || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${getPerformanceColor(value)}`}>{value}%</span>
                    {getPerformanceIcon(value)}
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {Math.round(Object.values(analyticsData?.performance || {}).reduce((a, b) => a + b, 0) / 4)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Performance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Current project distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Active Projects</span>
                </div>
                <span className="font-medium">{analyticsData?.projects.active}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <span className="font-medium">{analyticsData?.projects.completed}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm">On Time</span>
                </div>
                <span className="font-medium">{analyticsData?.projects.onTime}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Delayed</span>
                </div>
                <span className="font-medium">{analyticsData?.projects.delayed}</span>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600 mb-1">
                    {Math.round(((analyticsData?.projects.onTime || 0) / (analyticsData?.projects.completed || 1)) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">On-Time Delivery Rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
            <CardDescription>Your working hours breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">This Week</span>
                <span className="font-medium">{analyticsData?.timeTracking.totalHoursThisWeek}h</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">This Month</span>
                <span className="font-medium">{analyticsData?.timeTracking.totalHoursThisMonth}h</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily Average</span>
                <span className="font-medium">{analyticsData?.timeTracking.averageDailyHours}h</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Most Productive Day</span>
                <span className="font-medium">{analyticsData?.timeTracking.mostProductiveDay}</span>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 mb-1">
                    {analyticsData?.timeTracking.averageDailyHours}h
                  </div>
                  <p className="text-sm text-muted-foreground">Average Daily Hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Completed task', project: 'E-commerce Website', time: '2 hours ago' },
                { action: 'Submitted code review', project: 'Mobile App', time: '4 hours ago' },
                { action: 'Attended meeting', project: 'Team Sync', time: '1 day ago' },
                { action: 'Updated documentation', project: 'API Integration', time: '2 days ago' },
                { action: 'Fixed bug', project: 'Payment System', time: '3 days ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.project}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
