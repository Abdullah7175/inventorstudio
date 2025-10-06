import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  Briefcase, 
  BookOpen, 
  HelpCircle, 
  Award, 
  Handshake,
  MessageSquare,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Calendar
} from 'lucide-react';

interface DashboardStats {
  services: number;
  portfolioProjects: number;
  blogPosts: number;
  faqItems: number;
  certifications: number;
  partnerships: number;
  seoContent: number;
  contactMessages: number;
}

interface RecentActivity {
  id: string;
  type: 'service' | 'portfolio' | 'blog' | 'faq' | 'certification' | 'partnership' | 'seo_content' | 'contact';
  title: string;
  action: 'created' | 'updated' | 'published' | 'received';
  timestamp: string;
  status?: string;
}

export default function SEODashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    services: 0,
    portfolioProjects: 0,
    blogPosts: 0,
    faqItems: 0,
    certifications: 0,
    partnerships: 0,
    seoContent: 0,
    contactMessages: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats: DashboardStats = {
      services: 6,
      portfolioProjects: 12,
      blogPosts: 8,
      faqItems: 15,
      certifications: 5,
      partnerships: 3,
      seoContent: 4,
      contactMessages: 23
    };

    const mockActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'service',
        title: 'Shopify Expert Development',
        action: 'created',
        timestamp: '2025-01-05T10:30:00Z',
        status: 'published'
      },
      {
        id: '2',
        type: 'contact',
        title: 'New contact form submission',
        action: 'received',
        timestamp: '2025-01-05T09:15:00Z'
      },
      {
        id: '3',
        type: 'blog',
        title: 'Best Practices for E-commerce SEO',
        action: 'published',
        timestamp: '2025-01-04T16:45:00Z',
        status: 'published'
      },
      {
        id: '4',
        type: 'portfolio',
        title: 'E-commerce Website Project',
        action: 'updated',
        timestamp: '2025-01-04T14:20:00Z',
        status: 'featured'
      },
      {
        id: '5',
        type: 'faq',
        title: 'What is Shopify CLI?',
        action: 'created',
        timestamp: '2025-01-03T11:00:00Z'
      }
    ];

    setStats(mockStats);
    setRecentActivity(mockActivity);
    setLoading(false);
  }, []);

  const getActivityIcon = (type: string) => {
    const icons = {
      service: Briefcase,
      portfolio: FileText,
      blog: BookOpen,
      faq: HelpCircle,
      certification: Award,
      partnership: Handshake,
      seo_content: Search,
      contact: MessageSquare
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getActivityColor = (action: string) => {
    const colors = {
      created: 'text-green-600',
      updated: 'text-blue-600',
      published: 'text-purple-600',
      received: 'text-orange-600'
    };
    return colors[action as keyof typeof colors] || 'text-gray-600';
  };

  const formatTime = (timestamp: string) => {
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

  if (loading) {
    return (
      <div className="space-y-6">
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
          <h1 className="text-3xl font-bold">SEO Content Dashboard</h1>
          <p className="text-muted-foreground">Manage all website content and SEO optimization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>SEO Active</span>
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.services}</div>
            <p className="text-xs text-muted-foreground">
              Active services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Projects</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.portfolioProjects}</div>
            <p className="text-xs text-muted-foreground">
              Featured projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blogPosts}</div>
            <p className="text-xs text-muted-foreground">
              Published posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contactMessages}</div>
            <p className="text-xs text-muted-foreground">
              New messages
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest content updates and submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <div className="flex items-center space-x-2">
                          {activity.status && (
                            <Badge variant="outline" className="text-xs">
                              {activity.status}
                            </Badge>
                          )}
                          <span className={`text-xs capitalize ${getActivityColor(activity.action)}`}>
                            {activity.action}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {activity.type.replace('_', ' ')} • {formatTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common content management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <Plus className="h-6 w-6 text-blue-600 mb-1" />
                    <span className="text-xs font-medium">Add Service</span>
                  </div>
                </Card>
                <Card className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <FileText className="h-6 w-6 text-green-600 mb-1" />
                    <span className="text-xs font-medium">Add Project</span>
                  </div>
                </Card>
                <Card className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <BookOpen className="h-6 w-6 text-purple-600 mb-1" />
                    <span className="text-xs font-medium">Write Post</span>
                  </div>
                </Card>
                <Card className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <HelpCircle className="h-6 w-6 text-orange-600 mb-1" />
                    <span className="text-xs font-medium">Add FAQ</span>
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FAQ Items</CardTitle>
            <HelpCircle className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.faqItems}</div>
            <p className="text-xs text-muted-foreground">
              Help articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certifications}</div>
            <p className="text-xs text-muted-foreground">
              Active certifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partnerships</CardTitle>
            <Handshake className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.partnerships}</div>
            <p className="text-xs text-muted-foreground">
              Active partnerships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Content</CardTitle>
            <Search className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.seoContent}</div>
            <p className="text-xs text-muted-foreground">
              SEO pages
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
