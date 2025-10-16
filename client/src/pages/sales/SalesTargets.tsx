import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Target, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Plus,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  BarChart3,
  User
} from 'lucide-react';

interface SalesTarget {
  id: number;
  userId: string;
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  targetType: string;
  targetValue: number;
  achievedValue: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface TargetFormData {
  userId: string;
  period: string;
  year: string;
  month: string;
  quarter: string;
  targetType: string;
  targetValue: string;
}

export default function SalesTargets() {
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [filteredTargets, setFilteredTargets] = useState<SalesTarget[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<SalesTarget | null>(null);
  const [formData, setFormData] = useState<TargetFormData>({
    userId: '',
    period: 'monthly',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    quarter: '1',
    targetType: 'revenue',
    targetValue: ''
  });

  useEffect(() => {
    fetchTargets();
  }, []);

  useEffect(() => {
    filterTargets();
  }, [targets, searchTerm, periodFilter, typeFilter]);

  const fetchTargets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sales/targets');
      if (response.ok) {
        const data = await response.json();
        setTargets(data);
      }
    } catch (error) {
      console.error('Error fetching targets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTargets = () => {
    let filtered = targets;

    if (searchTerm) {
      filtered = filtered.filter(target =>
        target.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (periodFilter !== 'all') {
      filtered = filtered.filter(target => target.period === periodFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(target => target.targetType === typeFilter);
    }

    setFilteredTargets(filtered);
  };

  const handleCreateTarget = async () => {
    try {
      const response = await fetch('/api/sales/targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year),
          month: formData.period === 'monthly' ? parseInt(formData.month) : null,
          quarter: formData.period === 'quarterly' ? parseInt(formData.quarter) : null,
          targetValue: parseFloat(formData.targetValue),
        }),
      });

      if (response.ok) {
        await fetchTargets();
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating target:', error);
    }
  };

  const handleUpdateTarget = async () => {
    if (!editingTarget) return;

    try {
      const response = await fetch(`/api/sales/targets/${editingTarget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year),
          month: formData.period === 'monthly' ? parseInt(formData.month) : null,
          quarter: formData.period === 'quarterly' ? parseInt(formData.quarter) : null,
          targetValue: parseFloat(formData.targetValue),
        }),
      });

      if (response.ok) {
        await fetchTargets();
        resetForm();
        setIsDialogOpen(false);
        setEditingTarget(null);
      }
    } catch (error) {
      console.error('Error updating target:', error);
    }
  };

  const handleDeleteTarget = async (targetId: number) => {
    if (!confirm('Are you sure you want to delete this target?')) return;

    try {
      const response = await fetch(`/api/sales/targets/${targetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTargets();
      }
    } catch (error) {
      console.error('Error deleting target:', error);
    }
  };

  const handleEditTarget = (target: SalesTarget) => {
    setEditingTarget(target);
    setFormData({
      userId: target.userId,
      period: target.period,
      year: target.year.toString(),
      month: target.month?.toString() || '',
      quarter: target.quarter?.toString() || '',
      targetType: target.targetType,
      targetValue: target.targetValue.toString()
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      period: 'monthly',
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString(),
      quarter: '1',
      targetType: 'revenue',
      targetValue: ''
    });
    setEditingTarget(null);
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="h-4 w-4" />;
      case 'leads':
        return <Users className="h-4 w-4" />;
      case 'opportunities':
        return <Target className="h-4 w-4" />;
      case 'deals_closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTargetTypeColor = (type: string) => {
    switch (type) {
      case 'revenue':
        return 'bg-green-100 text-green-800';
      case 'leads':
        return 'bg-blue-100 text-blue-800';
      case 'opportunities':
        return 'bg-purple-100 text-purple-800';
      case 'deals_closed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'quarterly':
        return 'bg-green-100 text-green-800';
      case 'yearly':
        return 'bg-purple-100 text-purple-800';
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
      year: 'numeric'
    });
  };

  const getProgressPercentage = (achieved: number, target: number) => {
    return Math.min((achieved / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-600';
    if (percentage >= 75) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getTopPerformers = () => {
    return targets
      .filter(target => target.targetType === 'revenue')
      .sort((a, b) => {
        const aProgress = getProgressPercentage(a.achievedValue, a.targetValue);
        const bProgress = getProgressPercentage(b.achievedValue, b.targetValue);
        return bProgress - aProgress;
      })
      .slice(0, 5);
  };

  const getOverallStats = () => {
    const totalTargets = targets.length;
    const achievedTargets = targets.filter(target => 
      getProgressPercentage(target.achievedValue, target.targetValue) >= 100
    ).length;
    const totalTargetValue = targets.reduce((sum, target) => sum + target.targetValue, 0);
    const totalAchievedValue = targets.reduce((sum, target) => sum + target.achievedValue, 0);
    
    return {
      totalTargets,
      achievedTargets,
      achievementRate: totalTargets > 0 ? (achievedTargets / totalTargets) * 100 : 0,
      totalTargetValue,
      totalAchievedValue,
      overallProgress: totalTargetValue > 0 ? (totalAchievedValue / totalTargetValue) * 100 : 0
    };
  };

  const stats = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Targets</h1>
          <p className="text-muted-foreground">Set and track sales targets for your team</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Set Target
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTarget ? 'Edit Target' : 'Set New Target'}
              </DialogTitle>
              <DialogDescription>
                {editingTarget ? 'Update target information' : 'Set a new sales target'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Team Member</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="User ID or email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select value={formData.period} onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="2024"
                  />
                </div>
                {formData.period === 'monthly' && (
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select value={formData.month} onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.period === 'quarterly' && (
                  <div className="space-y-2">
                    <Label htmlFor="quarter">Quarter</Label>
                    <Select value={formData.quarter} onValueChange={(value) => setFormData(prev => ({ ...prev, quarter: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Q1</SelectItem>
                        <SelectItem value="2">Q2</SelectItem>
                        <SelectItem value="3">Q3</SelectItem>
                        <SelectItem value="4">Q4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetType">Target Type</Label>
                <Select value={formData.targetType} onValueChange={(value) => setFormData(prev => ({ ...prev, targetType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="leads">Leads</SelectItem>
                    <SelectItem value="opportunities">Opportunities</SelectItem>
                    <SelectItem value="deals_closed">Deals Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetValue">Target Value</Label>
                <Input
                  id="targetValue"
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                  placeholder="10000"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingTarget ? handleUpdateTarget : handleCreateTarget}>
                {editingTarget ? 'Update Target' : 'Set Target'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTargets}</div>
            <p className="text-xs text-muted-foreground">Active targets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievement Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.achievementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Targets achieved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalTargetValue)}</div>
            <p className="text-xs text-muted-foreground">All targets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of total targets</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Team members exceeding their targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getTopPerformers().map((target, index) => {
              const progress = getProgressPercentage(target.achievedValue, target.targetValue);
              return (
                <div key={target.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">
                        {target.user?.firstName} {target.user?.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {target.user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(target.achievedValue)}</div>
                      <div className="text-xs text-muted-foreground">Achieved</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(target.targetValue)}</div>
                      <div className="text-xs text-muted-foreground">Target</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{progress.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                    </div>
                    <div className="w-20">
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Targets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Targets</CardTitle>
          <CardDescription>View and manage all sales targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search targets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="opportunities">Opportunities</SelectItem>
                <SelectItem value="deals_closed">Deals Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Achieved</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded w-32"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded w-8"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredTargets.length > 0 ? (
                  filteredTargets.map((target) => {
                    const progress = getProgressPercentage(target.achievedValue, target.targetValue);
                    const isAchieved = progress >= 100;
                    
                    return (
                      <TableRow key={target.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {target.user?.firstName} {target.user?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {target.user?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPeriodColor(target.period)}>
                            {target.period}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {target.year}
                            {target.month && ` - ${target.month}`}
                            {target.quarter && ` - Q${target.quarter}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTargetTypeColor(target.targetType)}>
                            <div className="flex items-center space-x-1">
                              {getTargetTypeIcon(target.targetType)}
                              <span className="capitalize">{target.targetType.replace('_', ' ')}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {target.targetType === 'revenue' 
                              ? formatCurrency(target.targetValue)
                              : target.targetValue.toLocaleString()
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {target.targetType === 'revenue' 
                              ? formatCurrency(target.achievedValue)
                              : target.achievedValue.toLocaleString()
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{progress.toFixed(1)}%</span>
                              <span className="text-muted-foreground">
                                {target.achievedValue.toLocaleString()} / {target.targetValue.toLocaleString()}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={isAchieved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            <div className="flex items-center space-x-1">
                              {isAchieved ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              <span>{isAchieved ? 'Achieved' : 'In Progress'}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTarget(target)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTarget(target.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No targets found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
