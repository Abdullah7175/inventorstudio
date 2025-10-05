import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Calendar,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Plus
} from 'lucide-react';
import { useLocation } from 'wouter';

interface DashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    department?: string;
    skills?: string[];
  };
  projectStats: {
    total: number;
    pending: number;
    inProgress: number;
    review: number;
    completed: number;
  };
  assignedProjects: any[];
  recentActivities: any[];
}

function StatCard({ title, value, description, icon: Icon, trend }: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
          {trend && (
            <span className="ml-2 text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{project.projectName}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Customer</span>
            <span className="font-medium">{project.customer?.name || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">{project.budget || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Timeline</span>
            <span className="font-medium">{project.timeline || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created': return <FolderOpen className="h-4 w-4 text-blue-500" />;
      case 'project_updated': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'message': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {activity.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}

export default function TeamDashboard() {
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState('7d');

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['team-dashboard', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/team/dashboard?timeRange=${timeRange}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in as team member');
        }
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json() as Promise<DashboardData>;
    },
    retry: (failureCount, error) => {
      if (error.message.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 3;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Team Dashboard</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Team Dashboard</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load dashboard data</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  const { user, projectStats, assignedProjects, recentActivities } = dashboardData!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.firstName}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your assigned projects
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={projectStats.total}
          description="Assigned to you"
          icon={FolderOpen}
        />
        <StatCard
          title="In Progress"
          value={projectStats.inProgress}
          description="Currently working on"
          icon={Clock}
        />
        <StatCard
          title="Under Review"
          value={projectStats.review}
          description="Awaiting feedback"
          icon={CheckCircle}
        />
        <StatCard
          title="Completed"
          value={projectStats.completed}
          description="This month"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Your latest assigned projects
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation('/team/projects')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {assignedProjects.length > 0 ? (
              <div className="space-y-4">
                {assignedProjects.slice(0, 3).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No projects assigned yet</p>
                <p className="text-sm text-muted-foreground">
                  Projects will appear here when they are assigned to you
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No recent activity</p>
                <p className="text-sm text-muted-foreground">
                  Activity updates will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setLocation('/team/projects')}
            >
              <FolderOpen className="h-6 w-6 mb-2" />
              View My Projects
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setLocation('/team/messages')}
            >
              <MessageSquare className="h-6 w-6 mb-2" />
              Check Messages
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setLocation('/team/profile')}
            >
              <Users className="h-6 w-6 mb-2" />
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
