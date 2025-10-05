import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  UserCheck, 
  Settings, 
  MessageSquare, 
  Bell, 
  Mail, 
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  Database,
  Globe,
  Activity
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    path: '/admin/users',
    children: [
      { id: 'all-users', label: 'All Users', icon: Users, path: '/admin/users' }
    ]
  },
  {
    id: 'projects',
    label: 'Project Management',
    icon: FolderOpen,
    path: '/admin/projects',
    children: [
      { id: 'all-projects', label: 'All Projects', icon: FolderOpen, path: '/admin/projects' }
    ]
  },
  {
    id: 'customers',
    label: 'Customer Management',
    icon: UserCheck,
    path: '/admin/customers',
    children: [
      { id: 'customer-list', label: 'Customer List', icon: UserCheck, path: '/admin/customers' }
    ]
  },
  {
    id: 'teams',
    label: 'Team Management',
    icon: Shield,
    path: '/admin/teams',
    children: [
      { id: 'team-members', label: 'Team Members', icon: Users, path: '/admin/teams/members' }
    ]
  },
  {
    id: 'communications',
    label: 'Communications',
    icon: MessageSquare,
    path: '/admin/communications',
    children: [
      { id: 'chat', label: 'Chat Management', icon: MessageSquare, path: '/admin/communications/chat' },
      { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/communications/notifications' },
      { id: 'emails', label: 'Email Management', icon: Mail, path: '/admin/communications/emails' }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/admin/analytics',
    children: [
      { id: 'overview', label: 'Overview', icon: BarChart3, path: '/admin/analytics' },
      { id: 'revenue', label: 'Revenue', icon: Activity, path: '/admin/analytics/revenue' },
      { id: 'performance', label: 'Performance', icon: Globe, path: '/admin/analytics/performance' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/admin/settings',
    children: [
      { id: 'general', label: 'General Settings', icon: Settings, path: '/admin/settings' },
      { id: 'security', label: 'Security', icon: Shield, path: '/admin/settings/security' },
      { id: 'integrations', label: 'Integrations', icon: Globe, path: '/admin/settings/integrations' }
    ]
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => location === path || location.startsWith(path + '/');

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const isCurrentActive = isActive(item.path);

    return (
      <div key={item.id}>
        <div
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
            isCurrentActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          } ${level > 0 ? 'ml-4' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else {
              setLocation(item.path);
              setSidebarOpen(false);
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <ChevronRight 
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            />
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Admin Portal</h1>
                <p className="text-sm text-muted-foreground">Inventor Design Studio</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold">
                  {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="font-medium">{(user as any)?.firstName} {(user as any)?.lastName}</p>
                <p className="text-sm text-muted-foreground capitalize">{(user as any)?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-card border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
