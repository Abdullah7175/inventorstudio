import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  FolderOpen,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  isPositive: boolean;
  icon: React.ComponentType<any>;
  description?: string;
}

function MetricCard({ title, value, change, isPositive, icon: Icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-1 text-xs">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600" />
          )}
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">from last month</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface ChartData {
  month: string;
  revenue: number;
  users: number;
  projects: number;
}

interface TopCustomer {
  id: string;
  name: string;
  revenue: number;
  projects: number;
  lastActivity: Date;
}

interface ProjectStatus {
  status: string;
  count: number;
  percentage: number;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'performance'>('overview');

  // Mock data - in real app, this would come from API
  const metrics = {
    totalRevenue: 145600,
    monthlyRevenue: 45600,
    totalUsers: 1247,
    activeUsers: 892,
    totalProjects: 89,
    completedProjects: 67,
    avgProjectTime: 18.5,
    customerSatisfaction: 4.7,
    revenueGrowth: 15.3,
    userGrowth: 12.5,
    projectGrowth: 8.2,
    satisfactionGrowth: 2.1
  };

  const chartData: ChartData[] = [
    { month: 'Jan', revenue: 32000, users: 950, projects: 12 },
    { month: 'Feb', revenue: 38000, users: 1020, projects: 15 },
    { month: 'Mar', revenue: 42000, users: 1080, projects: 18 },
    { month: 'Apr', revenue: 39000, users: 1120, projects: 14 },
    { month: 'May', revenue: 45000, users: 1180, projects: 20 },
    { month: 'Jun', revenue: 45600, users: 1247, projects: 22 }
  ];

  const topCustomers: TopCustomer[] = [
    {
      id: '1',
      name: 'TechCorp Inc.',
      revenue: 45000,
      projects: 5,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      id: '2',
      name: 'Marketing Agency',
      revenue: 32000,
      projects: 8,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 4)
    },
    {
      id: '3',
      name: 'StartupXYZ',
      revenue: 28000,
      projects: 3,
      lastActivity: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: '4',
      name: 'Local Business Co.',
      revenue: 15000,
      projects: 2,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
    }
  ];

  const projectStatuses: ProjectStatus[] = [
    { status: 'Completed', count: 67, percentage: 75.3 },
    { status: 'Active', count: 18, percentage: 20.2 },
    { status: 'On Hold', count: 3, percentage: 3.4 },
    { status: 'Cancelled', count: 1, percentage: 1.1 }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'project_completed',
      description: 'Website Redesign project completed',
      customer: 'TechCorp Inc.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      value: 25000
    },
    {
      id: '2',
      type: 'new_customer',
      description: 'New customer registered',
      customer: 'StartupABC',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      value: 0
    },
    {
      id: '3',
      type: 'payment_received',
      description: 'Payment received',
      customer: 'Marketing Agency',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      value: 15000
    },
    {
      id: '4',
      type: 'project_started',
      description: 'Mobile App project started',
      customer: 'Local Business Co.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      value: 20000
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'new_customer':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'payment_received':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'project_started':
        return <FolderOpen className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track business performance and key metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'revenue' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('revenue')}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Revenue
        </Button>
        <Button
          variant={activeTab === 'performance' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('performance')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Performance
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(metrics.totalRevenue)}
              change={metrics.revenueGrowth}
              isPositive={true}
              icon={DollarSign}
              description="All-time revenue"
            />
            <MetricCard
              title="Monthly Revenue"
              value={formatCurrency(metrics.monthlyRevenue)}
              change={metrics.revenueGrowth}
              isPositive={true}
              icon={TrendingUp}
              description="This month"
            />
            <MetricCard
              title="Total Users"
              value={metrics.totalUsers.toLocaleString()}
              change={metrics.userGrowth}
              isPositive={true}
              icon={Users}
              description="Registered users"
            />
            <MetricCard
              title="Active Users"
              value={metrics.activeUsers.toLocaleString()}
              change={metrics.userGrowth}
              isPositive={true}
              icon={CheckCircle}
              description="Active this month"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Projects"
              value={metrics.totalProjects}
              change={metrics.projectGrowth}
              isPositive={true}
              icon={FolderOpen}
              description="All projects"
            />
            <MetricCard
              title="Completed Projects"
              value={metrics.completedProjects}
              change={metrics.projectGrowth}
              isPositive={true}
              icon={CheckCircle}
              description="Successfully finished"
            />
            <MetricCard
              title="Avg Project Time"
              value={`${metrics.avgProjectTime} days`}
              change={-5.2}
              isPositive={false}
              icon={Clock}
              description="Average completion time"
            />
            <MetricCard
              title="Customer Satisfaction"
              value={`${metrics.customerSatisfaction}/5`}
              change={metrics.satisfactionGrowth}
              isPositive={true}
              icon={TrendingUp}
              description="Average rating"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Revenue chart would be displayed here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Integration with charting library needed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Current project status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectStatuses.map((status) => (
                    <div key={status.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{status.status}</span>
                        <span className="text-sm text-muted-foreground">
                          {status.count} ({status.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${status.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Highest revenue generating customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.projects} projects • Last active: {formatTimestamp(customer.lastActivity)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(customer.revenue)}</div>
                        <div className="text-sm text-muted-foreground">Total revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest business activities and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.customer} • {formatTimestamp(activity.timestamp)}
                        </p>
                        {activity.value > 0 && (
                          <p className="text-xs text-green-600 font-medium">
                            +{formatCurrency(activity.value)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Detailed revenue analysis and forecasting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Revenue Analytics</h3>
              <p className="text-muted-foreground">
                Detailed revenue charts, forecasts, and breakdowns would be displayed here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Team and project performance analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Performance Analytics</h3>
              <p className="text-muted-foreground">
                Team performance, project efficiency, and productivity metrics would be displayed here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
