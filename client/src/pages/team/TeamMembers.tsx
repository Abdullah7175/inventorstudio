import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Filter,
  MessageSquare,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  TrendingUp
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  skills: string[];
  avatar?: string;
  email: string;
  phone?: string;
  location?: string;
  joinDate: string;
  lastActive: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  projects: number;
  completedTasks: number;
  currentWorkload: number;
  performance: {
    efficiency: number;
    quality: number;
    collaboration: number;
  };
}

export default function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'John Doe',
        role: 'Software Developer',
        department: 'Development',
        skills: ['React', 'TypeScript', 'Node.js'],
        email: 'john.doe@team.inventorstudio.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        joinDate: '2024-01-15',
        lastActive: '2025-01-05T10:30:00Z',
        status: 'online',
        projects: 3,
        completedTasks: 45,
        currentWorkload: 75,
        performance: {
          efficiency: 87,
          quality: 92,
          collaboration: 89
        }
      },
      {
        id: '2',
        name: 'Jane Smith',
        role: 'UI/UX Designer',
        department: 'Design',
        skills: ['Figma', 'Adobe XD', 'Sketch'],
        email: 'jane.smith@team.inventorstudio.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        joinDate: '2024-02-01',
        lastActive: '2025-01-05T09:15:00Z',
        status: 'away',
        projects: 2,
        completedTasks: 32,
        currentWorkload: 60,
        performance: {
          efficiency: 91,
          quality: 95,
          collaboration: 88
        }
      },
      {
        id: '3',
        name: 'Mike Johnson',
        role: 'Project Manager',
        department: 'Management',
        skills: ['Agile', 'Scrum', 'Jira'],
        email: 'mike.johnson@team.inventorstudio.com',
        phone: '+1 (555) 345-6789',
        location: 'Chicago, IL',
        joinDate: '2024-01-01',
        lastActive: '2025-01-05T11:00:00Z',
        status: 'busy',
        projects: 5,
        completedTasks: 28,
        currentWorkload: 90,
        performance: {
          efficiency: 85,
          quality: 88,
          collaboration: 94
        }
      },
      {
        id: '4',
        name: 'Sarah Wilson',
        role: 'Backend Developer',
        department: 'Development',
        skills: ['Python', 'Django', 'PostgreSQL'],
        email: 'sarah.wilson@team.inventorstudio.com',
        phone: '+1 (555) 456-7890',
        location: 'Austin, TX',
        joinDate: '2024-03-10',
        lastActive: '2025-01-04T16:45:00Z',
        status: 'offline',
        projects: 4,
        completedTasks: 38,
        currentWorkload: 65,
        performance: {
          efficiency: 89,
          quality: 90,
          collaboration: 85
        }
      },
      {
        id: '5',
        name: 'David Brown',
        role: 'DevOps Engineer',
        department: 'Infrastructure',
        skills: ['AWS', 'Docker', 'Kubernetes'],
        email: 'david.brown@team.inventorstudio.com',
        phone: '+1 (555) 567-8901',
        location: 'Seattle, WA',
        joinDate: '2024-02-15',
        lastActive: '2025-01-05T08:20:00Z',
        status: 'online',
        projects: 2,
        completedTasks: 22,
        currentWorkload: 50,
        performance: {
          efficiency: 93,
          quality: 91,
          collaboration: 87
        }
      }
    ];

    setTeamMembers(mockTeamMembers);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
      offline: 'bg-gray-400'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-400';
  };

  const getStatusText = (status: string) => {
    const texts = {
      online: 'Online',
      away: 'Away',
      busy: 'Busy',
      offline: 'Offline'
    };
    return texts[status as keyof typeof texts] || 'Unknown';
  };

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 80) return 'text-red-600';
    if (workload >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || member.role.toLowerCase().includes(filterRole.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;

    return matchesSearch && matchesRole && matchesDepartment;
  });

  const departments = [...new Set(teamMembers.map(member => member.department))];
  const roles = [...new Set(teamMembers.map(member => member.role))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Team Members</h1>
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
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Meet your team and collaborate effectively</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.status === 'online').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Different departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(teamMembers.reduce((acc, member) => 
                acc + (member.performance.efficiency + member.performance.quality + member.performance.collaboration) / 3, 0
              ) / teamMembers.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Team efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {member.department}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getStatusText(member.status)}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-3 w-3 mr-2" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-3 w-3 mr-2" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-2" />
                    <span>{member.location}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div>
                <p className="text-sm font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {member.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-muted rounded">
                  <div className="text-sm font-semibold">{member.projects}</div>
                  <div className="text-xs text-muted-foreground">Projects</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-sm font-semibold">{member.completedTasks}</div>
                  <div className="text-xs text-muted-foreground">Tasks</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className={`text-sm font-semibold ${getWorkloadColor(member.currentWorkload)}`}>
                    {member.currentWorkload}%
                  </div>
                  <div className="text-xs text-muted-foreground">Workload</div>
                </div>
              </div>

              {/* Performance */}
              <div>
                <p className="text-sm font-medium mb-2">Performance</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Efficiency</span>
                    <span>{member.performance.efficiency}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-primary h-1 rounded-full" 
                      style={{ width: `${member.performance.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Last Active */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Last active {formatLastActive(member.lastActive)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Message
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No team members found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
