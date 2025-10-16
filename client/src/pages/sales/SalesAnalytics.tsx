import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  DollarSign, 
  Target, 
  Users, 
  Calendar,
  Download,
  RefreshCw,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

interface SalesMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number;
  totalLeads: number;
  leadsGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  averageDealSize: number;
  dealSizeGrowth: number;
  salesCycle: number;
  cycleGrowth: number;
}

interface PerformanceData {
  userId: string;
  userName: string;
  revenue: number;
  dealsClosed: number;
  leadsGenerated: number;
  conversionRate: number;
  averageDealSize: number;
  salesCycle: number;
}

interface PipelineData {
  stage: string;
  count: number;
  value: number;
  probability: number;
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  leads: number;
  deals: number;
  conversionRate: number;
}

interface SourceData {
  source: string;
  leads: number;
  revenue: number;
  conversionRate: number;
}

export default function SalesAnalytics() {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    quarterlyRevenue: 0,
    yearlyRevenue: 0,
    revenueGrowth: 0,
    totalLeads: 0,
    leadsGrowth: 0,
    conversionRate: 0,
    conversionGrowth: 0,
    averageDealSize: 0,
    dealSizeGrowth: 0,
    salesCycle: 0,
    cycleGrowth: 0
  });

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch metrics
      const metricsResponse = await fetch(`/api/sales/analytics/metrics?range=${timeRange}`);
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        // Ensure all required fields have default values
        setMetrics({
          totalRevenue: metricsData.totalRevenue || 0,
          monthlyRevenue: metricsData.monthlyRevenue || 0,
          quarterlyRevenue: metricsData.quarterlyRevenue || 0,
          yearlyRevenue: metricsData.yearlyRevenue || 0,
          revenueGrowth: metricsData.revenueGrowth || 0,
          totalLeads: metricsData.totalLeads || 0,
          leadsGrowth: metricsData.leadsGrowth || 0,
          conversionRate: metricsData.conversionRate || 0,
          conversionGrowth: metricsData.conversionGrowth || 0,
          averageDealSize: metricsData.averageDealSize || 0,
          dealSizeGrowth: metricsData.dealSizeGrowth || 0,
          salesCycle: metricsData.salesCycle || 0,
          cycleGrowth: metricsData.cycleGrowth || 0
        });
      }

      // Fetch performance data
      const performanceResponse = await fetch(`/api/sales/analytics/performance?range=${timeRange}`);
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformanceData(Array.isArray(performanceData) ? performanceData : []);
      }

      // Fetch pipeline data
      const pipelineResponse = await fetch(`/api/sales/analytics/pipeline?range=${timeRange}`);
      if (pipelineResponse.ok) {
        const pipelineData = await pipelineResponse.json();
        setPipelineData(Array.isArray(pipelineData) ? pipelineData : []);
      }

      // Fetch time series data
      const timeSeriesResponse = await fetch(`/api/sales/analytics/timeseries?range=${timeRange}`);
      if (timeSeriesResponse.ok) {
        const timeSeriesData = await timeSeriesResponse.json();
        setTimeSeriesData(Array.isArray(timeSeriesData) ? timeSeriesData : []);
      }

      // Fetch source data
      const sourceResponse = await fetch(`/api/sales/analytics/sources?range=${timeRange}`);
      if (sourceResponse.ok) {
        const sourceData = await sourceResponse.json();
        setSourceData(Array.isArray(sourceData) ? sourceData : []);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
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

  const formatPercentage = (value: number) => {
    return `${(value || 0) >= 0 ? '+' : ''}${(value || 0).toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPerformanceRank = (index: number) => {
    switch (index) {
      case 0:
        return { icon: <Award className="h-4 w-4 text-yellow-600" />, text: '1st' };
      case 1:
        return { icon: <Award className="h-4 w-4 text-gray-600" />, text: '2nd' };
      case 2:
        return { icon: <Award className="h-4 w-4 text-orange-600" />, text: '3rd' };
      default:
        return { icon: null, text: `${index + 1}th` };
    }
  };

  const exportData = () => {
    const data = {
      metrics,
      performanceData,
      pipelineData,
      timeSeriesData,
      sourceData,
      exportedAt: new Date().toISOString(),
      timeRange
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold">Sales Analytics</h1>
          <p className="text-muted-foreground">Track your sales performance and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className={`text-xs flex items-center ${getGrowthColor(metrics.revenueGrowth)}`}>
              {getGrowthIcon(metrics.revenueGrowth)}
              <span className="ml-1">{formatPercentage(metrics.revenueGrowth)} from last period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.conversionRate || 0).toFixed(1)}%</div>
            <p className={`text-xs flex items-center ${getGrowthColor(metrics.conversionGrowth)}`}>
              {getGrowthIcon(metrics.conversionGrowth)}
              <span className="ml-1">{formatPercentage(metrics.conversionGrowth)} from last period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageDealSize)}</div>
            <p className={`text-xs flex items-center ${getGrowthColor(metrics.dealSizeGrowth)}`}>
              {getGrowthIcon(metrics.dealSizeGrowth)}
              <span className="ml-1">{formatPercentage(metrics.dealSizeGrowth)} from last period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Cycle</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.salesCycle || 0).toFixed(0)} days</div>
            <p className={`text-xs flex items-center ${getGrowthColor(-metrics.cycleGrowth)}`}>
              {getGrowthIcon(-metrics.cycleGrowth)}
              <span className="ml-1">{formatPercentage(-metrics.cycleGrowth)} from last period</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Revenue by time period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium">Monthly</span>
                </div>
                <span className="text-sm font-bold">{formatCurrency(metrics.monthlyRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium">Quarterly</span>
                </div>
                <span className="text-sm font-bold">{formatCurrency(metrics.quarterlyRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="text-sm font-medium">Yearly</span>
                </div>
                <span className="text-sm font-bold">{formatCurrency(metrics.yearlyRevenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Top performing lead sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sourceData.slice(0, 5).map((source, index) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {source.source.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {(source.conversionRate || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{source.leads || 0} leads</span>
                    <span>{formatCurrency(source.revenue || 0)}</span>
                  </div>
                  <Progress value={source.conversionRate || 0} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
            <CardDescription>Current pipeline status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineData.map((stage) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {stage.stage.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stage.count || 0} deals
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(stage.value || 0)}</span>
                    <span>{(stage.probability || 0).toFixed(0)}%</span>
                  </div>
                  <Progress value={stage.probability || 0} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Individual sales performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((member, index) => {
              const rank = getPerformanceRank(index);
              return (
                <div key={member.userId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {rank.icon}
                      <span className="text-sm font-medium">{rank.text}</span>
                    </div>
                    <div>
                      <div className="font-medium">{member.userName}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.dealsClosed || 0} deals • {member.leadsGenerated || 0} leads
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(member.revenue || 0)}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{(member.conversionRate || 0).toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Conversion</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(member.averageDealSize || 0)}</div>
                      <div className="text-xs text-muted-foreground">Avg Deal</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{(member.salesCycle || 0).toFixed(0)}d</div>
                      <div className="text-xs text-muted-foreground">Cycle</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Series Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Revenue performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center">
              <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Revenue Trend Chart</h3>
              <p className="text-muted-foreground">
                Chart visualization would be implemented with a charting library like Recharts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common analytics tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span>Export Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Target className="h-6 w-6" />
              <span>Set Targets</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Activity className="h-6 w-6" />
              <span>View Forecast</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
