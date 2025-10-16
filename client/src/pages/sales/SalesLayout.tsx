import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  FileText, 
  Calendar, 
  Target, 
  BarChart3, 
  Handshake, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  User,
  ChevronDown,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SalesLayoutProps {
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
    path: '/sales'
  },
  {
    id: 'leads',
    label: 'Lead Management',
    icon: Users,
    path: '/sales/leads'
  },
  {
    id: 'opportunities',
    label: 'Sales Pipeline',
    icon: TrendingUp,
    path: '/sales/opportunities'
  },
  {
    id: 'proposals',
    label: 'Proposals',
    icon: FileText,
    path: '/sales/proposals'
  },
  {
    id: 'follow-ups',
    label: 'Follow-ups',
    icon: Calendar,
    path: '/sales/follow-ups'
  },
  {
    id: 'targets',
    label: 'Sales Targets',
    icon: Target,
    path: '/sales/targets'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/sales/analytics'
  },
  {
    id: 'business-development',
    label: 'Business Development',
    icon: Handshake,
    path: '/sales/business-development'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/sales/settings'
  }
];

export default function SalesLayout({ children }: SalesLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [location] = useLocation();
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
        <Link
          to={item.path}
          className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isCurrentActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          } ${level > 0 ? 'ml-4' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            )}
          </div>
        </Link>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Sales Portal</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-background border-r">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Sales Portal</h2>
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user && typeof user === 'object' && 'firstName' in user ? `${user.firstName} ${(user as any).lastName || ''}` : 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user && typeof user === 'object' && 'role' in user ? String(user.role) : 'Unknown'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />
              
              <div className="flex items-center gap-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium">
                    {user && typeof user === 'object' && 'firstName' in user ? `${user.firstName} ${(user as any).lastName || ''}` : 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user && typeof user === 'object' && 'role' in user ? String(user.role) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
