import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Calendar,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DashboardStats {
  totalLeads: number;
  activeOpportunities: number;
  monthlyRevenue: number;
  conversionRate: number;
  monthlyTarget: number;
  targetProgress: number;
}

interface RecentActivity {
  id: string;
  type: 'lead' | 'opportunity' | 'proposal' | 'follow_up';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  status?: string;
}

interface UpcomingFollowUps {
  id: string;
  title: string;
  type: string;
  scheduledDate: string;
  client: string;
  priority: string;
}

export default function SalesDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeOpportunities: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    monthlyTarget: 0,
    targetProgress: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<UpcomingFollowUps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard data
      const dashboardResponse = await fetch('/api/sales/dashboard');
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setStats({
          totalLeads: dashboardData.totalLeads || 0,
          activeOpportunities: dashboardData.activeOpportunities || 0,
          monthlyRevenue: dashboardData.totalEstimatedValue || 0,
          conversionRate: dashboardData.totalLeads > 0 ? (dashboardData.activeOpportunities / dashboardData.totalLeads) * 100 : 0,
          monthlyTarget: 100000, // Default target
          targetProgress: dashboardData.totalEstimatedValue ? (dashboardData.totalEstimatedValue / 100000) * 100 : 0
        });
        setRecentActivities(dashboardData.recentLeads?.map((lead: any) => ({
          id: lead.id.toString(),
          type: 'lead' as const,
          title: `New lead: ${lead.firstName} ${lead.lastName}`,
          description: `From ${lead.company || 'Unknown company'}`,
          timestamp: lead.createdAt,
          user: lead.assignedTo || 'Unassigned',
          status: lead.status
        })) || []);
        setUpcomingFollowUps(dashboardData.upcomingFollowUps?.map((followUp: any) => ({
          id: followUp.id.toString(),
          title: followUp.title || 'Follow-up',
          type: followUp.type || 'call',
          scheduledDate: followUp.scheduledDate,
          client: followUp.clientName || 'Unknown',
          priority: followUp.priority || 'medium'
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead':
        return <Users className="h-4 w-4" />;
      case 'opportunity':
        return <TrendingUp className="h-4 w-4" />;
      case 'proposal':
        return <DollarSign className="h-4 w-4" />;
      case 'follow_up':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lead':
        return 'text-blue-600';
      case 'opportunity':
        return 'text-green-600';
      case 'proposal':
        return 'text-purple-600';
      case 'follow_up':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFollowUpIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'demo':
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                </CardTitle>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-muted-foreground">Overview of your sales performance and activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +15% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -2% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Target Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Target Progress</CardTitle>
          <CardDescription>Track your progress towards monthly sales targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Revenue Target</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(stats.monthlyRevenue)} / {formatCurrency(stats.monthlyTarget)}
              </span>
            </div>
            <Progress value={stats.targetProgress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {stats.targetProgress.toFixed(1)}% completed
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(stats.monthlyTarget - stats.monthlyRevenue)} remaining
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest sales activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">by {activity.user}</span>
                        {activity.status && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No recent activities</h3>
                  <p className="text-muted-foreground">
                    Activities will appear here as you work with leads and opportunities.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Follow-ups */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Follow-ups</CardTitle>
            <CardDescription>Scheduled follow-ups and meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingFollowUps.length > 0 ? (
                upcomingFollowUps.map((followUp) => (
                  <div key={followUp.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="p-2 rounded-full bg-muted">
                      {getFollowUpIcon(followUp.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{followUp.title}</p>
                        <Badge className={getPriorityColor(followUp.priority)}>
                          {followUp.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{followUp.client}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(followUp.scheduledDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No upcoming follow-ups</h3>
                  <p className="text-muted-foreground">
                    Schedule follow-ups to stay on top of your leads and opportunities.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Add New Lead</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span>Create Opportunity</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule Follow-up</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Target className="h-6 w-6" />
              <span>View Targets</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
