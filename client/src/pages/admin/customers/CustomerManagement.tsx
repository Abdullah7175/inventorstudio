import React, { useState, useEffect, useCallback } from 'react';
import UserModal from '@/components/UserModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  UserCheck, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Mail, 
  Eye,
  Plus,
  DollarSign,
  FolderOpen,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive' | 'prospect';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  projectsCount: number;
  activeProjects: number;
  lastActivity: string | Date;
  createdAt: string | Date;
  location?: {
    city: string;
    country: string;
  };
  notes?: string;
}

export default function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshCustomers = () => {
    setRefreshKey(prev => prev + 1);
  };

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (tierFilter !== 'all') params.append('tier', tierFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('role', 'customer');

      const response = await fetch(`/api/admin/customers?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, tierFilter, searchTerm, refreshKey]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customer Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customer Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchCustomers}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for demonstration - will be replaced by real data
  const mockCustomers: Customer[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      status: 'active',
      tier: 'gold',
      totalSpent: 45000,
      projectsCount: 5,
      activeProjects: 2,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
      location: {
        city: 'San Francisco',
        country: 'USA'
      },
      notes: 'VIP customer, prefers direct communication'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@startupxyz.com',
      phone: '+1 (555) 987-6543',
      company: 'StartupXYZ',
      status: 'active',
      tier: 'silver',
      totalSpent: 15000,
      projectsCount: 2,
      activeProjects: 1,
      lastActivity: new Date(Date.now() - 1000 * 60 * 30),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
      location: {
        city: 'Austin',
        country: 'USA'
      }
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob@localbiz.com',
      phone: '+1 (555) 456-7890',
      company: 'Local Business Co.',
      status: 'prospect',
      tier: 'bronze',
      totalSpent: 0,
      projectsCount: 0,
      activeProjects: 0,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      location: {
        city: 'Portland',
        country: 'USA'
      },
      notes: 'Interested in brand identity package'
    },
    {
      id: '4',
      firstName: 'Alice',
      lastName: 'Brown',
      email: 'alice@marketingagency.com',
      phone: '+1 (555) 321-0987',
      company: 'Marketing Agency',
      status: 'active',
      tier: 'platinum',
      totalSpent: 125000,
      projectsCount: 12,
      activeProjects: 3,
      lastActivity: new Date(Date.now() - 1000 * 60 * 5),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365),
      location: {
        city: 'New York',
        country: 'USA'
      },
      notes: 'Long-term partner, excellent payment history'
    }
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      (customer.firstName && customer.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.lastName && customer.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesTier = tierFilter === 'all' || customer.tier === tierFilter;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return '💎';
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '👤';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'silver':
        return 'bg-gray-100 text-gray-800';
      case 'bronze':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastActivity = (date: string | Date | null) => {
    if (!date) return 'Never';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
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

  const handleEditCustomer = (customerId: string) => {
    console.log('Edit customer:', customerId);
    // Implement edit functionality
  };

  const handleDeleteCustomer = (customerId: string) => {
    console.log('Delete customer:', customerId);
    // Implement delete functionality
  };

  const handleViewCustomer = (customerId: string) => {
    console.log('View customer:', customerId);
    // Implement view functionality
  };

  const handleSendEmail = (email: string) => {
    console.log('Send email to:', email);
    // Implement email functionality
  };

  const handleCallCustomer = (phone: string) => {
    console.log('Call customer:', phone);
    // Implement call functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">Manage customer relationships, track interactions, and monitor value</p>
        </div>
        <UserModal mode="create" onUserUpdate={refreshCustomers}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </UserModal>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">All customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.status === 'prospect').length}
            </div>
            <p className="text-xs text-muted-foreground">Potential customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Customer lifetime value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>Search and filter customers by status, tier, or contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {customer.firstName[0]}{customer.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                          {customer.phone && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.location && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{customer.location.city}, {customer.location.country}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.company || 'Individual'}</div>
                        {customer.notes && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {customer.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierColor(customer.tier)}>
                        <div className="flex items-center space-x-1">
                          <span>{getTierIcon(customer.tier)}</span>
                          <span className="capitalize">{customer.tier}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{customer.projectsCount}</span>
                          <span className="text-muted-foreground">total</span>
                        </div>
                        {customer.activeProjects > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {customer.activeProjects} active
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">${customer.totalSpent.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatLastActivity(customer.lastActivity)}</span>
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
                          <DropdownMenuItem onClick={() => handleViewCustomer(customer.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCustomer(customer.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Customer
                          </DropdownMenuItem>
                          {customer.email && (
                            <DropdownMenuItem onClick={() => handleSendEmail(customer.email)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          )}
                          {customer.phone && (
                            <DropdownMenuItem onClick={() => handleCallCustomer(customer.phone!)}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call Customer
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => console.log('View projects:', customer.id)}>
                            <FolderOpen className="h-4 w-4 mr-2" />
                            View Projects
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No customers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
