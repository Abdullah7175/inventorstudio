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
  Calendar, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  Phone,
  Mail,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Building,
  Bell,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface FollowUp {
  id: number;
  leadId?: number;
  opportunityId?: number;
  clientId?: string;
  type: string;
  subject: string;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
  status: string;
  priority: string;
  assignedTo: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lead?: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
  opportunity?: {
    title: string;
    stage: string;
  };
  client?: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
}

interface FollowUpFormData {
  type: string;
  subject: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  priority: string;
  assignedTo: string;
  notes: string;
  leadId: string;
  opportunityId: string;
  clientId: string;
}

export default function FollowUpManagement() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [filteredFollowUps, setFilteredFollowUps] = useState<FollowUp[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [formData, setFormData] = useState<FollowUpFormData>({
    type: 'call',
    subject: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'medium',
    assignedTo: '',
    notes: '',
    leadId: '',
    opportunityId: '',
    clientId: ''
  });

  useEffect(() => {
    fetchFollowUps();
  }, []);

  useEffect(() => {
    filterFollowUps();
  }, [followUps, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const fetchFollowUps = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sales/follow-ups');
      if (response.ok) {
        const data = await response.json();
        setFollowUps(data);
      }
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFollowUps = () => {
    let filtered = followUps;

    if (searchTerm) {
      filtered = filtered.filter(followUp =>
        followUp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followUp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followUp.lead?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followUp.lead?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followUp.client?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followUp.client?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(followUp => followUp.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(followUp => followUp.type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(followUp => followUp.priority === priorityFilter);
    }

    setFilteredFollowUps(filtered);
  };

  const handleCreateFollowUp = async () => {
    try {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const response = await fetch('/api/sales/follow-ups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          scheduledDate: scheduledDateTime.toISOString(),
          leadId: formData.leadId || null,
          opportunityId: formData.opportunityId || null,
          clientId: formData.clientId || null,
        }),
      });

      if (response.ok) {
        await fetchFollowUps();
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating follow-up:', error);
    }
  };

  const handleUpdateFollowUp = async () => {
    if (!editingFollowUp) return;

    try {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const response = await fetch(`/api/sales/follow-ups/${editingFollowUp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          scheduledDate: scheduledDateTime.toISOString(),
          leadId: formData.leadId || null,
          opportunityId: formData.opportunityId || null,
          clientId: formData.clientId || null,
        }),
      });

      if (response.ok) {
        await fetchFollowUps();
        resetForm();
        setIsDialogOpen(false);
        setEditingFollowUp(null);
      }
    } catch (error) {
      console.error('Error updating follow-up:', error);
    }
  };

  const handleDeleteFollowUp = async (followUpId: number) => {
    if (!confirm('Are you sure you want to delete this follow-up?')) return;

    try {
      const response = await fetch(`/api/sales/follow-ups/${followUpId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFollowUps();
      }
    } catch (error) {
      console.error('Error deleting follow-up:', error);
    }
  };

  const handleEditFollowUp = (followUp: FollowUp) => {
    setEditingFollowUp(followUp);
    const scheduledDate = new Date(followUp.scheduledDate);
    setFormData({
      type: followUp.type,
      subject: followUp.subject,
      description: followUp.description || '',
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      scheduledTime: scheduledDate.toTimeString().slice(0, 5),
      priority: followUp.priority,
      assignedTo: followUp.assignedTo,
      notes: followUp.notes || '',
      leadId: followUp.leadId?.toString() || '',
      opportunityId: followUp.opportunityId?.toString() || '',
      clientId: followUp.clientId || ''
    });
    setIsDialogOpen(true);
  };

  const handleCompleteFollowUp = async (followUpId: number) => {
    try {
      const response = await fetch(`/api/sales/follow-ups/${followUpId}/complete`, {
        method: 'PATCH',
      });

      if (response.ok) {
        await fetchFollowUps();
      }
    } catch (error) {
      console.error('Error completing follow-up:', error);
    }
  };

  const handleRescheduleFollowUp = async (followUpId: number) => {
    const newDate = prompt('Enter new date and time (YYYY-MM-DD HH:MM):');
    if (!newDate) return;

    try {
      const response = await fetch(`/api/sales/follow-ups/${followUpId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          scheduledDate: new Date(newDate).toISOString() 
        }),
      });

      if (response.ok) {
        await fetchFollowUps();
      }
    } catch (error) {
      console.error('Error rescheduling follow-up:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'call',
      subject: '',
      description: '',
      scheduledDate: '',
      scheduledTime: '',
      priority: 'medium',
      assignedTo: '',
      notes: '',
      leadId: '',
      opportunityId: '',
      clientId: ''
    });
    setEditingFollowUp(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
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
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'demo':
        return <Play className="h-4 w-4" />;
      case 'proposal':
        return <FileText className="h-4 w-4" />;
      case 'follow_up':
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'rescheduled':
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (scheduledDate: string, status: string) => {
    if (status === 'completed') return false;
    return new Date(scheduledDate) < new Date();
  };

  const getUpcomingFollowUps = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return followUps.filter(followUp => {
      const scheduledDate = new Date(followUp.scheduledDate);
      return followUp.status === 'scheduled' && 
             scheduledDate >= now && 
             scheduledDate <= tomorrow;
    });
  };

  const getOverdueFollowUps = () => {
    return followUps.filter(followUp => 
      isOverdue(followUp.scheduledDate, followUp.status)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Follow-up Management</h1>
          <p className="text-muted-foreground">Schedule and track follow-ups with leads and clients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFollowUp ? 'Edit Follow-up' : 'Schedule New Follow-up'}
              </DialogTitle>
              <DialogDescription>
                {editingFollowUp ? 'Update follow-up information' : 'Enter the follow-up details below'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
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
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Follow-up call with John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the follow-up..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Time</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Sales Representative"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingFollowUp ? handleUpdateFollowUp : handleCreateFollowUp}>
                {editingFollowUp ? 'Update Follow-up' : 'Schedule Follow-up'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {followUps.filter(f => f.status === 'scheduled').length}
            </div>
            <p className="text-xs text-muted-foreground">Active follow-ups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getUpcomingFollowUps().length}</div>
            <p className="text-xs text-muted-foreground">Next 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOverdueFollowUps().length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {followUps.filter(f => f.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-ups</CardTitle>
          <CardDescription>View and manage all your scheduled follow-ups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search follow-ups..."
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
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
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
                  <TableHead>Follow-up</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Scheduled</TableHead>
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
                        <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted animate-pulse rounded w-8"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredFollowUps.length > 0 ? (
                  filteredFollowUps.map((followUp) => (
                    <TableRow key={followUp.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{followUp.subject}</div>
                          {followUp.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {followUp.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {followUp.lead ? (
                            <>
                              <div className="font-medium">
                                {followUp.lead.firstName} {followUp.lead.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {followUp.lead.company || followUp.lead.email}
                              </div>
                            </>
                          ) : followUp.client ? (
                            <>
                              <div className="font-medium">
                                {followUp.client.firstName} {followUp.client.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {followUp.client.company || followUp.client.email}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">No contact info</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(followUp.type)}
                          <span className="capitalize">{followUp.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(followUp.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(followUp.status)}
                            <span className="capitalize">{followUp.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(followUp.priority)}>
                          {followUp.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm">{formatDate(followUp.scheduledDate)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(followUp.scheduledDate)}
                            </div>
                          </div>
                        </div>
                        {isOverdue(followUp.scheduledDate, followUp.status) && (
                          <div className="text-xs text-red-600 font-medium">Overdue</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{followUp.assignedTo}</span>
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
                            <DropdownMenuItem onClick={() => handleEditFollowUp(followUp)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {followUp.status === 'scheduled' && (
                              <DropdownMenuItem onClick={() => handleCompleteFollowUp(followUp.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {followUp.status === 'scheduled' && (
                              <DropdownMenuItem onClick={() => handleRescheduleFollowUp(followUp.id)}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteFollowUp(followUp.id)}
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
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No follow-ups found</h3>
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
