import React, { useState, useEffect, useCallback } from 'react';
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
        // Mock data for demonstration
        const mockPartnerships: Partnership[] = [
          {
            id: 1,
            company_name: 'Shopify',
            logo: 'https://example.com/shopify-logo.png',
            description: 'Official Shopify Partner providing e-commerce solutions',
            partnership_type: 'technology',
            website: 'https://shopify.com',
            status: 'active',
            start_date: '2024-01-15',
            order: 1,
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: 2,
            company_name: 'Google Cloud',
            logo: 'https://example.com/google-cloud-logo.png',
            description: 'Google Cloud Partner for cloud infrastructure solutions',
            partnership_type: 'strategic',
            website: 'https://cloud.google.com',
            status: 'active',
            start_date: '2023-09-01',
            order: 2,
            created_at: '2023-09-01T10:00:00Z'
          },
          {
            id: 3,
            company_name: 'Adobe',
            logo: 'https://example.com/adobe-logo.png',
            description: 'Adobe Creative Cloud Partner',
            partnership_type: 'integration',
            website: 'https://adobe.com',
            status: 'inactive',
            start_date: '2023-06-01',
            order: 3,
            created_at: '2023-06-01T10:00:00Z'
          }
        ];
        setPartnerships(mockPartnerships);
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Partnership
        </Button>
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
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Partnership
                          </DropdownMenuItem>
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
