import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Handshake,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Partnership {
  id: number;
  company_name: string;
  logo?: string;
  description?: string;
  partnership_type: string;
  website?: string;
  status: string;
  start_date?: string;
  order: number;
  created_at: string;
}

interface PartnershipModalProps {
  mode: 'create' | 'edit';
  existingPartnership?: Partnership;
  onPartnershipUpdate: () => void;
  children: React.ReactNode;
}

// Partnership Modal Component
function PartnershipModal({ mode, existingPartnership, onPartnershipUpdate, children }: PartnershipModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    logo: '',
    description: '',
    partnership_type: 'technology',
    website: '',
    status: 'active',
    start_date: '',
    order: 0
  });
  const { toast } = useToast();

  const partnershipTypes = [
    { value: 'technology', label: 'Technology' },
    { value: 'strategic', label: 'Strategic' },
    { value: 'integration', label: 'Integration' },
    { value: 'reseller', label: 'Reseller' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    if (open && mode === 'edit' && existingPartnership) {
      setFormData({
        company_name: existingPartnership.company_name,
        logo: existingPartnership.logo || '',
        description: existingPartnership.description || '',
        partnership_type: existingPartnership.partnership_type,
        website: existingPartnership.website || '',
        status: existingPartnership.status,
        start_date: existingPartnership.start_date ? existingPartnership.start_date.split('T')[0] : '',
        order: existingPartnership.order
      });
    } else if (open && mode === 'create') {
      setFormData({
        company_name: '',
        logo: '',
        description: '',
        partnership_type: 'technology',
        website: '',
        status: 'active',
        start_date: '',
        order: 0
      });
    }
  }, [open, mode, existingPartnership]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === 'create' ? '/api/seo/partnerships' : `/api/seo/partnerships/${existingPartnership?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Partnership ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        setOpen(false);
        onPartnershipUpdate();
      } else {
        throw new Error('Failed to save partnership');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save partnership",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      
      {open && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <Card 
            className="w-full max-w-6xl max-h-[90vh] overflow-y-auto mx-4 my-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>{mode === 'create' ? 'Add New Partnership' : 'Edit Partnership'}</CardTitle>
              <CardDescription>
                {mode === 'create' ? 'Add a new business partnership' : 'Update partnership information'}
              </CardDescription>
            </CardHeader>
            <CardContent onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Partner company name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Logo URL</label>
                    <Input
                      value={formData.logo}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the partnership"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Partnership Type</label>
                    <select
                      value={formData.partnership_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, partnership_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      {partnershipTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://partner-company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display Order</label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {mode === 'create' ? 'Create Partnership' : 'Update Partnership'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>,
        document.body
      )}
    </>
  );
}

export default function PartnershipsManagement() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPartnerships = useCallback(async () => {
    try {
      const response = await fetch('/api/seo/partnerships', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPartnerships(data);
      } else {
        console.error('Failed to fetch partnerships:', response.status, response.statusText);
        setPartnerships([]);
        toast({
          title: "Error",
          description: "Failed to fetch partnerships. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching partnerships:', error);
      toast({
        title: "Error",
        description: "Failed to fetch partnerships",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPartnerships();
  }, [fetchPartnerships]);

  const partnershipTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'technology', label: 'Technology' },
    { value: 'strategic', label: 'Strategic' },
    { value: 'integration', label: 'Integration' },
    { value: 'reseller', label: 'Reseller' }
  ];

  const filteredPartnerships = partnerships.filter(partnership => {
    const matchesSearch = partnership.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (partnership.description && partnership.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || partnership.status === statusFilter;
    const matchesType = typeFilter === 'all' || partnership.partnership_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Partnerships Management</h1>
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
          <h1 className="text-3xl font-bold">Partnerships Management</h1>
          <p className="text-muted-foreground">Manage your business partnerships and collaborations</p>
        </div>
        <PartnershipModal mode="create" onPartnershipUpdate={fetchPartnerships}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Partnership
          </Button>
        </PartnershipModal>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search partnerships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {partnershipTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Partnerships Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partnerships ({filteredPartnerships.length})</CardTitle>
          <CardDescription>Manage your business partnerships</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPartnerships.length === 0 ? (
            <div className="text-center py-8">
              <Handshake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No partnerships found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'Try adjusting your search criteria' : 'Get started by adding your first partnership'}
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Partnership
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartnerships.map((partnership) => (
                  <TableRow key={partnership.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                          {partnership.logo ? (
                            <img 
                              src={partnership.logo} 
                              alt={partnership.company_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Handshake className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{partnership.company_name}</div>
                          {partnership.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {partnership.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {partnership.partnership_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={partnership.status === 'active' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {partnership.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {partnership.start_date ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">
                            {new Date(partnership.start_date).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {partnership.website ? (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={partnership.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <PartnershipModal mode="edit" existingPartnership={partnership} onPartnershipUpdate={fetchPartnerships}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Partnership
                            </DropdownMenuItem>
                          </PartnershipModal>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Partnership
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
