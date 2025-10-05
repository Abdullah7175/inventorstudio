import React, { useState, useEffect, useCallback } from 'react';
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
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Mail, 
  Eye,
  Plus,
  Shield,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  UserPlus,
  Settings,
  Target
} from 'lucide-react';
import TeamMemberModal from '@/components/TeamMemberModal';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'designer' | 'support';
  department: 'development' | 'design' | 'marketing' | 'support' | 'management';
  status: 'active' | 'inactive' | 'on-leave';
  joinedDate: Date;
  lastActive: Date;
  projectsCount: number;
  workload: number; // percentage
  skills: string[];
  phone?: string;
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  department: string;
  memberCount: number;
}

export default function TeamManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'workload'>('members');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamRoles, setTeamRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshTeamMembers = () => {
    setRefreshKey(prev => prev + 1);
  };

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/team-members', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, [activeTab, roleFilter, departmentFilter, searchTerm, refreshKey]);

  const fetchTeamRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/team-roles', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTeamRoles(data);
      } else {
        console.error('Failed to fetch team roles');
      }
    } catch (error) {
      console.error('Error fetching team roles:', error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchTeamMembers();
    } else if (activeTab === 'roles') {
      fetchTeamRoles();
    }
  }, [activeTab, fetchTeamMembers, fetchTeamRoles]);

  // Mock data for demonstration - will be replaced by real data
  const mockTeamMembers: TeamMember[] = [
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@inventorstudio.com',
      role: 'manager',
      department: 'development',
      status: 'active',
      joinedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365),
      lastActive: new Date(Date.now() - 1000 * 60 * 5),
      projectsCount: 8,
      workload: 85,
      skills: ['React', 'Node.js', 'Project Management', 'Team Leadership'],
      phone: '+1 (555) 123-4567'
    },
    {
      id: '2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@inventorstudio.com',
      role: 'developer',
      department: 'development',
      status: 'active',
      joinedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
      lastActive: new Date(Date.now() - 1000 * 60 * 30),
      projectsCount: 5,
      workload: 70,
      skills: ['JavaScript', 'Python', 'Database Design', 'API Development'],
      phone: '+1 (555) 987-6543'
    },
    {
      id: '3',
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol.davis@inventorstudio.com',
      role: 'designer',
      department: 'design',
      status: 'active',
      joinedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 270),
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
      projectsCount: 6,
      workload: 90,
      skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
      phone: '+1 (555) 456-7890'
    },
    {
      id: '4',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@inventorstudio.com',
      role: 'support',
      department: 'support',
      status: 'on-leave',
      joinedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      projectsCount: 2,
      workload: 0,
      skills: ['Customer Support', 'Technical Writing', 'Problem Solving'],
      phone: '+1 (555) 321-0987'
    }
  ];

  const roles: Role[] = [
    {
      id: '1',
      name: 'Admin',
      description: 'Full system access and administrative privileges',
      permissions: ['user_management', 'project_management', 'system_settings', 'analytics'],
      department: 'management',
      memberCount: 2
    },
    {
      id: '2',
      name: 'Project Manager',
      description: 'Manage projects and coordinate team activities',
      permissions: ['project_management', 'team_coordination', 'client_communication'],
      department: 'development',
      memberCount: 1
    },
    {
      id: '3',
      name: 'Senior Developer',
      description: 'Lead development work and mentor junior developers',
      permissions: ['development', 'code_review', 'technical_planning'],
      department: 'development',
      memberCount: 1
    },
    {
      id: '4',
      name: 'UI/UX Designer',
      description: 'Design user interfaces and user experiences',
      permissions: ['design', 'prototyping', 'user_research'],
      department: 'design',
      memberCount: 1
    }
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      (member.user?.firstName && member.user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.user?.lastName && member.user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.user?.email && member.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || member.user?.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'manager':
        return <Users className="h-4 w-4" />;
      case 'developer':
        return <Settings className="h-4 w-4" />;
      case 'designer':
        return <Target className="h-4 w-4" />;
      case 'support':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'developer':
        return 'bg-green-100 text-green-800';
      case 'designer':
        return 'bg-purple-100 text-purple-800';
      case 'support':
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
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'bg-red-500';
    if (workload >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatLastActive = (date: string | Date | null) => {
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

  const handleEditMember = (memberId: string) => {
    console.log('Edit member:', memberId);
    // Implement edit functionality
  };

  const handleDeleteMember = (memberId: string) => {
    console.log('Delete member:', memberId);
    // Implement delete functionality
  };

  const handleViewMember = (memberId: string) => {
    console.log('View member:', memberId);
    // Implement view functionality
  };

  const handleSendEmail = (email: string) => {
    console.log('Send email to:', email);
    // Implement email functionality
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Team Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading team members...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Team Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchTeamMembers}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage team members, roles, and workload distribution</p>
        </div>
        <TeamMemberModal mode="create" onTeamMemberUpdate={refreshTeamMembers}>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </TeamMemberModal>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">Team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(teamMembers.map(m => m.user?.department).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Workload</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.length > 0 ? Math.round(teamMembers.reduce((sum, m) => sum + (m.projects?.length || 0), 0) / teamMembers.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Average capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'members' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('members')}
        >
          <Users className="h-4 w-4 mr-2" />
          Team Members
        </Button>
        <Button
          variant={activeTab === 'roles' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('roles')}
        >
          <Shield className="h-4 w-4 mr-2" />
          Roles & Permissions
        </Button>
        <Button
          variant={activeTab === 'workload' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('workload')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Workload
        </Button>
      </div>

      {/* Team Members Tab */}
      {activeTab === 'members' && (
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage team members, roles, and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Workload</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold">
                              {member.user?.firstName?.[0] || 'U'}{member.user?.lastName?.[0] || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {member.user?.firstName} {member.user?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{member.user?.email}</div>
                            {member.user?.phone && (
                              <div className="text-xs text-muted-foreground">{member.user.phone}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.role)}>
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(member.role)}
                            <span className="capitalize">{member.role}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {member.user?.department || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.isActive ? 'active' : 'inactive')}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{member.projects?.length || 0}</span>
                          <span className="text-muted-foreground">projects</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{member.projects?.length || 0}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${getWorkloadColor(member.projects?.length || 0)}`}
                              style={{ width: `${Math.min((member.projects?.length || 0) * 20, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatLastActive(member.user?.lastLogin || member.createdAt)}</span>
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
                            <DropdownMenuItem onClick={() => handleViewMember(member.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditMember(member.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Member
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(member.email)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No team members found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <Card>
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>Manage team roles and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {teamRoles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <Badge variant="outline">Role</Badge>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-2">Permissions:</div>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions && typeof role.permissions === 'object' ? 
                            Object.entries(role.permissions).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {value}
                              </Badge>
                            )) :
                            <Badge variant="secondary" className="text-xs">
                              No permissions defined
                            </Badge>
                          }
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {teamMembers.filter(m => m.role === role.name).length} member{teamMembers.filter(m => m.role === role.name).length !== 1 ? 's' : ''}
                        </span>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Role
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workload Tab */}
      {activeTab === 'workload' && (
        <Card>
          <CardHeader>
            <CardTitle>Workload Distribution</CardTitle>
            <CardDescription>Monitor team capacity and project allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {member.user?.firstName?.[0] || 'U'}{member.user?.lastName?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{member.user?.firstName} {member.user?.lastName}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {member.role} • {member.projects?.length || 0} projects
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{Math.min((member.projects?.length || 0) * 20, 100)}%</div>
                      <div className="text-xs text-muted-foreground">workload</div>
                    </div>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getWorkloadColor(member.projects?.length || 0)}`}
                        style={{ width: `${Math.min((member.projects?.length || 0) * 20, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
