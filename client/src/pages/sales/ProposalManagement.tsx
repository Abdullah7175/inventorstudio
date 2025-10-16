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
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  Send,
  Download,
  Calendar,
  DollarSign,
  Clock,
  User,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Proposal {
  id: number;
  opportunityId?: number;
  clientId: string;
  title: string;
  description?: string;
  proposalNumber: string;
  status: string;
  totalAmount: number;
  validUntil?: string;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items: ProposalItem[];
  client?: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
  opportunity?: {
    title: string;
    stage: string;
  };
}

interface ProposalItem {
  id: number;
  proposalId: number;
  serviceName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ProposalFormData {
  title: string;
  description: string;
  clientId: string;
  opportunityId: string;
  validUntil: string;
  items: ProposalItemFormData[];
}

interface ProposalItemFormData {
  serviceName: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export default function ProposalManagement() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    description: '',
    clientId: '',
    opportunityId: '',
    validUntil: '',
    items: [{ serviceName: '', description: '', quantity: '1', unitPrice: '' }]
  });

  useEffect(() => {
    fetchProposals();
  }, []);

  useEffect(() => {
    filterProposals();
  }, [proposals, searchTerm, statusFilter]);

  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sales/proposals');
      if (response.ok) {
        const data = await response.json();
        setProposals(data);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProposals = () => {
    let filtered = proposals;

    if (searchTerm) {
      filtered = filtered.filter(proposal =>
        proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.client?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.client?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.client?.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === statusFilter);
    }

    setFilteredProposals(filtered);
  };

  const handleCreateProposal = async () => {
    try {
      const response = await fetch('/api/sales/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          opportunityId: formData.opportunityId || null,
          validUntil: formData.validUntil || null,
          items: formData.items.map(item => ({
            ...item,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseInt(item.quantity) * parseFloat(item.unitPrice)
          }))
        }),
      });

      if (response.ok) {
        await fetchProposals();
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const handleUpdateProposal = async () => {
    if (!editingProposal) return;

    try {
      const response = await fetch(`/api/sales/proposals/${editingProposal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          opportunityId: formData.opportunityId || null,
          validUntil: formData.validUntil || null,
          items: formData.items.map(item => ({
            ...item,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseInt(item.quantity) * parseFloat(item.unitPrice)
          }))
        }),
      });

      if (response.ok) {
        await fetchProposals();
        resetForm();
        setIsDialogOpen(false);
        setEditingProposal(null);
      }
    } catch (error) {
      console.error('Error updating proposal:', error);
    }
  };

  const handleDeleteProposal = async (proposalId: number) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;

    try {
      const response = await fetch(`/api/sales/proposals/${proposalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProposals();
      }
    } catch (error) {
      console.error('Error deleting proposal:', error);
    }
  };

  const handleEditProposal = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setFormData({
      title: proposal.title,
      description: proposal.description || '',
      clientId: proposal.clientId,
      opportunityId: proposal.opportunityId?.toString() || '',
      validUntil: proposal.validUntil || '',
      items: proposal.items.length > 0 ? proposal.items.map(item => ({
        serviceName: item.serviceName,
        description: item.description || '',
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString()
      })) : [{ serviceName: '', description: '', quantity: '1', unitPrice: '' }]
    });
    setIsDialogOpen(true);
  };

  const handleSendProposal = async (proposalId: number) => {
    try {
      const response = await fetch(`/api/sales/proposals/${proposalId}/send`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchProposals();
      }
    } catch (error) {
      console.error('Error sending proposal:', error);
    }
  };

  const handleDuplicateProposal = async (proposal: Proposal) => {
    try {
      const response = await fetch('/api/sales/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${proposal.title} (Copy)`,
          description: proposal.description,
          clientId: proposal.clientId,
          opportunityId: proposal.opportunityId,
          validUntil: proposal.validUntil,
          items: proposal.items.map(item => ({
            serviceName: item.serviceName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }),
      });

      if (response.ok) {
        await fetchProposals();
      }
    } catch (error) {
      console.error('Error duplicating proposal:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      clientId: '',
      opportunityId: '',
      validUntil: '',
      items: [{ serviceName: '', description: '', quantity: '1', unitPrice: '' }]
    });
    setEditingProposal(null);
  };

  const addProposalItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { serviceName: '', description: '', quantity: '1', unitPrice: '' }]
    }));
  };

  const removeProposalItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateProposalItem = (index: number, field: keyof ProposalItemFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'viewed':
        return <Eye className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposal Management</h1>
          <p className="text-muted-foreground">Create and manage sales proposals and quotations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProposal ? 'Edit Proposal' : 'Create New Proposal'}
              </DialogTitle>
              <DialogDescription>
                {editingProposal ? 'Update proposal information' : 'Enter the proposal details below'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Proposal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Website Development Proposal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the proposal..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Proposal Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addProposalItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label>Service Name</Label>
                          <Input
                            value={item.serviceName}
                            onChange={(e) => updateProposalItem(index, 'serviceName', e.target.value)}
                            placeholder="Web Development"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateProposalItem(index, 'description', e.target.value)}
                            placeholder="Custom website development"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateProposalItem(index, 'quantity', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateProposalItem(index, 'unitPrice', e.target.value)}
                            placeholder="1000.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Total</Label>
                          <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                            {formatCurrency((parseInt(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0))}
                          </div>
                        </div>
                      </div>
                      {formData.items.length > 1 && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProposalItem(index)}
                          >
                            Remove Item
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      Total: {formatCurrency(calculateTotal())}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingProposal ? handleUpdateProposal : handleCreateProposal}>
                {editingProposal ? 'Update Proposal' : 'Create Proposal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.length}</div>
            <p className="text-xs text-muted-foreground">All proposals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.filter(p => ['draft', 'sent', 'viewed'].includes(p.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.filter(p => p.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(proposals.reduce((sum, p) => sum + p.totalAmount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">All proposals</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Proposals</CardTitle>
          <CardDescription>View and manage all your proposals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search proposals..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Created</TableHead>
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
                ) : filteredProposals.length > 0 ? (
                  filteredProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{proposal.title}</div>
                          <div className="text-sm text-muted-foreground">
                            #{proposal.proposalNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {proposal.client?.firstName} {proposal.client?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {proposal.client?.company || proposal.client?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(proposal.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(proposal.status)}
                            <span className="capitalize">{proposal.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(proposal.totalAmount)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(proposal.validUntil)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(proposal.createdAt)}</span>
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
                            <DropdownMenuItem onClick={() => handleEditProposal(proposal)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            {proposal.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleSendProposal(proposal.id)}>
                                <Send className="h-4 w-4 mr-2" />
                                Send
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicateProposal(proposal)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProposal(proposal.id)}
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
                    <TableCell colSpan={7} className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No proposals found</h3>
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
