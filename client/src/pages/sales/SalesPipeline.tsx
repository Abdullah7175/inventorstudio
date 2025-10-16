import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  TrendingUp, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  Calendar,
  DollarSign,
  Target,
  Clock,
  User,
  Building,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  BarChart3
} from 'lucide-react';

interface Opportunity {
  id: number;
  leadId?: number;
  clientId?: string;
  title: string;
  description?: string;
  stage: string;
  probability: number;
  estimatedValue: number;
  actualValue?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  assignedTo: string;
  source?: string;
  priority: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  lead?: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
  client?: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
}

interface OpportunityFormData {
  title: string;
  description: string;
  stage: string;
  probability: string;
  estimatedValue: string;
  expectedCloseDate: string;
  assignedTo: string;
  source: string;
  priority: string;
  notes: string;
  tags: string[];
}

const pipelineStages = [
  { id: 'prospecting', name: 'Prospecting', color: 'bg-gray-100 text-gray-800' },
  { id: 'qualification', name: 'Qualification', color: 'bg-blue-100 text-blue-800' },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-100 text-green-800' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-100 text-red-800' }
];

export default function SalesPipeline() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('pipeline');
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    description: '',
    stage: 'prospecting',
    probability: '0',
    estimatedValue: '',
    expectedCloseDate: '',
    assignedTo: '',
    source: '',
    priority: 'medium',
    notes: '',
    tags: []
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, searchTerm, stageFilter, priorityFilter]);

  const fetchOpportunities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sales/opportunities');
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOpportunities = () => {
    let filtered = opportunities;

    if (searchTerm) {
      filtered = filtered.filter(opportunity =>
        opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.lead?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.lead?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.client?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.client?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter(opportunity => opportunity.stage === stageFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(opportunity => opportunity.priority === priorityFilter);
    }

    setFilteredOpportunities(filtered);
  };

  const handleCreateOpportunity = async () => {
    try {
      const response = await fetch('/api/sales/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          probability: parseInt(formData.probability),
          estimatedValue: parseFloat(formData.estimatedValue),
          expectedCloseDate: formData.expectedCloseDate || null,
        }),
      });

      if (response.ok) {
        await fetchOpportunities();
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
    }
  };

  const handleUpdateOpportunity = async () => {
    if (!editingOpportunity) return;

    try {
      const response = await fetch(`/api/sales/opportunities/${editingOpportunity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          probability: parseInt(formData.probability),
          estimatedValue: parseFloat(formData.estimatedValue),
          expectedCloseDate: formData.expectedCloseDate || null,
        }),
      });

      if (response.ok) {
        await fetchOpportunities();
        resetForm();
        setIsDialogOpen(false);
        setEditingOpportunity(null);
      }
    } catch (error) {
      console.error('Error updating opportunity:', error);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: number) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      const response = await fetch(`/api/sales/opportunities/${opportunityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchOpportunities();
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    }
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      title: opportunity.title,
      description: opportunity.description || '',
      stage: opportunity.stage,
      probability: opportunity.probability.toString(),
      estimatedValue: opportunity.estimatedValue.toString(),
      expectedCloseDate: opportunity.expectedCloseDate || '',
      assignedTo: opportunity.assignedTo,
      source: opportunity.source || '',
      priority: opportunity.priority,
      notes: opportunity.notes || '',
      tags: opportunity.tags || []
    });
    setIsDialogOpen(true);
  };

  const handleStageChange = async (opportunityId: number, newStage: string) => {
    try {
      const response = await fetch(`/api/sales/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (response.ok) {
        await fetchOpportunities();
      }
    } catch (error) {
      console.error('Error updating opportunity stage:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      stage: 'prospecting',
      probability: '0',
      estimatedValue: '',
      expectedCloseDate: '',
      assignedTo: '',
      source: '',
      priority: 'medium',
      notes: '',
      tags: []
    });
    setEditingOpportunity(null);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'prospecting':
        return <User className="h-4 w-4" />;
      case 'qualification':
        return <Target className="h-4 w-4" />;
      case 'proposal':
        return <FileText className="h-4 w-4" />;
      case 'negotiation':
        return <TrendingUp className="h-4 w-4" />;
      case 'closed_won':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed_lost':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getOpportunitiesByStage = (stage: string) => {
    return filteredOpportunities.filter(opp => opp.stage === stage);
  };

  const calculatePipelineValue = () => {
    return filteredOpportunities.reduce((sum, opp) => {
      return sum + (opp.estimatedValue * (opp.probability / 100));
    }, 0);
  };

  const calculateStageValue = (stage: string) => {
    const stageOpps = getOpportunitiesByStage(stage);
    return stageOpps.reduce((sum, opp) => sum + opp.estimatedValue, 0);
  };

  const addTag = () => {
    const tag = prompt('Enter a tag:');
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground">Track and manage your sales opportunities</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('pipeline')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Pipeline
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
                </DialogTitle>
                <DialogDescription>
                  {editingOpportunity ? 'Update opportunity information' : 'Enter the opportunity details below'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Website Development Project"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the opportunity..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Select value={formData.stage} onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {pipelineStages.map(stage => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probability (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData(prev => ({ ...prev, probability: e.target.value }))}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedValue">Estimated Value</Label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                      placeholder="10000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                    <Input
                      id="expectedCloseDate"
                      type="date"
                      value={formData.expectedCloseDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this opportunity..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addTag}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tag
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingOpportunity ? handleUpdateOpportunity : handleCreateOpportunity}>
                  {editingOpportunity ? 'Update Opportunity' : 'Create Opportunity'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities.length}</div>
            <p className="text-xs text-muted-foreground">All stages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(calculatePipelineValue())}</div>
            <p className="text-xs text-muted-foreground">Weighted by probability</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.filter(opp => !['closed_won', 'closed_lost'].includes(opp.stage)).length}
            </div>
            <p className="text-xs text-muted-foreground">In pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.length > 0 
                ? Math.round((opportunities.filter(opp => opp.stage === 'closed_won').length / opportunities.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Closed deals</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunities</CardTitle>
          <CardDescription>View and manage your sales opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {pipelineStages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === 'pipeline' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {pipelineStages.map((stage) => {
                const stageOpportunities = getOpportunitiesByStage(stage.id);
                const stageValue = calculateStageValue(stage.id);
                
                return (
                  <Card key={stage.id} className="min-h-[400px]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                        <Badge variant="secondary">{stageOpportunities.length}</Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {formatCurrency(stageValue)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isLoading ? (
                        [...Array(3)].map((_, i) => (
                          <div key={i} className="h-20 bg-muted animate-pulse rounded"></div>
                        ))
                      ) : stageOpportunities.length > 0 ? (
                        stageOpportunities.map((opportunity) => (
                          <div
                            key={opportunity.id}
                            className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleEditOpportunity(opportunity)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="text-sm font-medium line-clamp-2">
                                  {opportunity.title}
                                </h4>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditOpportunity(opportunity)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteOpportunity(opportunity.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">{formatCurrency(opportunity.estimatedValue)}</span>
                                  <span className="text-muted-foreground">{opportunity.probability}%</span>
                                </div>
                                <Progress value={opportunity.probability} className="h-1" />
                              </div>

                              <div className="text-xs text-muted-foreground">
                                {opportunity.lead ? (
                                  <div>
                                    <div>{opportunity.lead.firstName} {opportunity.lead.lastName}</div>
                                    {opportunity.lead.company && (
                                      <div>{opportunity.lead.company}</div>
                                    )}
                                  </div>
                                ) : opportunity.client ? (
                                  <div>
                                    <div>{opportunity.client.firstName} {opportunity.client.lastName}</div>
                                    {opportunity.client.company && (
                                      <div>{opportunity.client.company}</div>
                                    )}
                                  </div>
                                ) : (
                                  <div>No contact info</div>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <Badge className={getPriorityColor(opportunity.priority)}>
                                  {opportunity.priority}
                                </Badge>
                                {opportunity.expectedCloseDate && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(opportunity.expectedCloseDate)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-sm">No opportunities</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Expected Close</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
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
                          <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted animate-pulse rounded w-8"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredOpportunities.length > 0 ? (
                    filteredOpportunities.map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{opportunity.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {opportunity.lead ? (
                                `${opportunity.lead.firstName} ${opportunity.lead.lastName}`
                              ) : opportunity.client ? (
                                `${opportunity.client.firstName} ${opportunity.client.lastName}`
                              ) : (
                                'No contact info'
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={pipelineStages.find(s => s.id === opportunity.stage)?.color}>
                            {pipelineStages.find(s => s.id === opportunity.stage)?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(opportunity.estimatedValue)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{opportunity.probability}%</span>
                            <Progress value={opportunity.probability} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(opportunity.expectedCloseDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(opportunity.priority)}>
                            {opportunity.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{opportunity.assignedTo}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditOpportunity(opportunity)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteOpportunity(opportunity.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No opportunities found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search or filter criteria.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
