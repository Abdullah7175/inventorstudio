import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Handshake, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  Building,
  User,
  Calendar,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Users,
  Globe,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

interface BusinessDevelopmentOpportunity {
  id: number;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  companyName?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  estimatedValue?: number;
  expectedTimeline?: string;
  assignedTo: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Partnership {
  id: number;
  companyName: string;
  logo?: string;
  description?: string;
  partnershipType: string;
  website?: string;
  status: string;
  startDate?: string;
  order: number;
  createdAt: string;
}

interface BDInsights {
  totalOpportunities: number;
  activePartnerships: number;
  pipelineValue: number;
  conversionRate: number;
  topPerformingTypes: Array<{
    type: string;
    count: number;
    value: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

interface BDFormData {
  title: string;
  description: string;
  type: string;
  priority: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  estimatedValue: string;
  expectedTimeline: string;
  assignedTo: string;
  notes: string;
  tags: string[];
}

export default function BusinessDevelopment() {
  const [opportunities, setOpportunities] = useState<BusinessDevelopmentOpportunity[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [insights, setInsights] = useState<BDInsights>({
    totalOpportunities: 0,
    activePartnerships: 0,
    pipelineValue: 0,
    conversionRate: 0,
    topPerformingTypes: [],
    recentActivities: []
  });
  const [filteredOpportunities, setFilteredOpportunities] = useState<BusinessDevelopmentOpportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<BusinessDevelopmentOpportunity | null>(null);
  const [formData, setFormData] = useState<BDFormData>({
    title: '',
    description: '',
    type: 'partnership',
    priority: 'medium',
    companyName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    estimatedValue: '',
    expectedTimeline: '',
    assignedTo: '',
    notes: '',
    tags: []
  });

  useEffect(() => {
    fetchBDData();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const fetchBDData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch opportunities
      const opportunitiesResponse = await fetch('/api/sales/business-development/opportunities');
      if (opportunitiesResponse.ok) {
        const opportunitiesData = await opportunitiesResponse.json();
        setOpportunities(opportunitiesData);
      }

      // Fetch partnerships
      const partnershipsResponse = await fetch('/api/sales/business-development/partnerships');
      if (partnershipsResponse.ok) {
        const partnershipsData = await partnershipsResponse.json();
        setPartnerships(partnershipsData);
      }

      // Fetch insights
      const insightsResponse = await fetch('/api/sales/business-development/insights');
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData);
      }
    } catch (error) {
      console.error('Error fetching BD data:', error);
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
        opportunity.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(opportunity => opportunity.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(opportunity => opportunity.type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(opportunity => opportunity.priority === priorityFilter);
    }

    setFilteredOpportunities(filtered);
  };

  const handleCreateOpportunity = async () => {
    try {
      const response = await fetch('/api/sales/business-development/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        }),
      });

      if (response.ok) {
        await fetchBDData();
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating BD opportunity:', error);
    }
  };

  const handleUpdateOpportunity = async () => {
    if (!editingOpportunity) return;

    try {
      const response = await fetch(`/api/sales/business-development/opportunities/${editingOpportunity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        }),
      });

      if (response.ok) {
        await fetchBDData();
        resetForm();
        setIsDialogOpen(false);
        setEditingOpportunity(null);
      }
    } catch (error) {
      console.error('Error updating BD opportunity:', error);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: number) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      const response = await fetch(`/api/sales/business-development/opportunities/${opportunityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBDData();
      }
    } catch (error) {
      console.error('Error deleting BD opportunity:', error);
    }
  };

  const handleEditOpportunity = (opportunity: BusinessDevelopmentOpportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      title: opportunity.title,
      description: opportunity.description || '',
      type: opportunity.type,
      priority: opportunity.priority,
      companyName: opportunity.companyName || '',
      contactPerson: opportunity.contactPerson || '',
      contactEmail: opportunity.contactEmail || '',
      contactPhone: opportunity.contactPhone || '',
      estimatedValue: opportunity.estimatedValue?.toString() || '',
      expectedTimeline: opportunity.expectedTimeline || '',
      assignedTo: opportunity.assignedTo,
      notes: opportunity.notes || '',
      tags: opportunity.tags || []
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'partnership',
      priority: 'medium',
      companyName: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      estimatedValue: '',
      expectedTimeline: '',
      assignedTo: '',
      notes: '',
      tags: []
    });
    setEditingOpportunity(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'partnership':
        return <Handshake className="h-4 w-4" />;
      case 'collaboration':
        return <Users className="h-4 w-4" />;
      case 'strategic_alliance':
        return <Target className="h-4 w-4" />;
      case 'vendor_relationship':
        return <Building className="h-4 w-4" />;
      case 'corporate_client':
        return <Briefcase className="h-4 w-4" />;
      case 'expansion':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
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
          <h1 className="text-3xl font-bold">Business Development</h1>
          <p className="text-muted-foreground">Track partnerships, collaborations, and strategic opportunities</p>
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
                  placeholder="Strategic Partnership with TechCorp"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="collaboration">Collaboration</SelectItem>
                      <SelectItem value="strategic_alliance">Strategic Alliance</SelectItem>
                      <SelectItem value="vendor_relationship">Vendor Relationship</SelectItem>
                      <SelectItem value="corporate_client">Corporate Client</SelectItem>
                      <SelectItem value="expansion">Expansion</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="TechCorp Inc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="john@techcorp.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedValue">Estimated Value</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                    placeholder="100000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedTimeline">Expected Timeline</Label>
                  <Input
                    id="expectedTimeline"
                    value={formData.expectedTimeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedTimeline: e.target.value }))}
                    placeholder="3-6 months"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="BD Manager"
                  />
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">All BD opportunities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partnerships</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.activePartnerships}</div>
            <p className="text-xs text-muted-foreground">Current partnerships</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(insights.pipelineValue)}</div>
            <p className="text-xs text-muted-foreground">Total opportunity value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(insights.conversionRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Opportunity conversion</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Types */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Types</CardTitle>
          <CardDescription>Most successful business development types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.topPerformingTypes.map((type, index) => (
              <div key={type.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(type.type)}
                    <span className="font-medium capitalize">{type.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-medium">{type.count}</div>
                    <div className="text-xs text-muted-foreground">Opportunities</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(type.value)}</div>
                    <div className="text-xs text-muted-foreground">Value</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest business development activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-muted">
                  {getTypeIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">by {activity.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Business Development Opportunities</CardTitle>
          <CardDescription>Track and manage all BD opportunities</CardDescription>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="collaboration">Collaboration</SelectItem>
                <SelectItem value="strategic_alliance">Strategic Alliance</SelectItem>
                <SelectItem value="vendor_relationship">Vendor Relationship</SelectItem>
                <SelectItem value="corporate_client">Corporate Client</SelectItem>
                <SelectItem value="expansion">Expansion</SelectItem>
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Timeline</TableHead>
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
                        <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
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
                        <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
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
                          {opportunity.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {opportunity.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {opportunity.companyName && (
                            <div className="font-medium">{opportunity.companyName}</div>
                          )}
                          {opportunity.contactPerson && (
                            <div className="text-sm text-muted-foreground">{opportunity.contactPerson}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(opportunity.type)}
                          <span className="capitalize">{opportunity.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(opportunity.status)}>
                          {opportunity.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(opportunity.priority)}>
                          {opportunity.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(opportunity.estimatedValue)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{opportunity.expectedTimeline || 'N/A'}</span>
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
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
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
                      <Handshake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
        </CardContent>
      </Card>
    </div>
  );
}
