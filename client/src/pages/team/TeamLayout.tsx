import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Settings, 
  Bell, 
  LogOut,
  Menu,
  X,
  Calendar,
  MessageSquare,
  BarChart3,
  User
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/team', icon: LayoutDashboard },
  { name: 'My Projects', href: '/team/projects', icon: FolderOpen },
  { name: 'Team', href: '/team/team', icon: Users },
  { name: 'Messages', href: '/team/messages', icon: MessageSquare },
  { name: 'Calendar', href: '/team/calendar', icon: Calendar },
  { name: 'Analytics', href: '/team/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/team/profile', icon: User },
  { name: 'Settings', href: '/team/settings', icon: Settings },
];

interface TeamLayoutProps {
  children: React.ReactNode;
}

export default function TeamLayout({ children }: TeamLayoutProps) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">T</span>
              </div>
              <span className="font-semibold">Team Portal</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setLocation(item.href);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            ))}
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r min-h-screen">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">T</span>
              </div>
              <span className="font-semibold">Team Portal</span>
            </div>
          </div>
          
          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <span className="font-semibold">
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
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setLocation(item.href)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-4 left-4 right-4">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="bg-card border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Team Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden">
        {/* Mobile header */}
        <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">T</span>
            </div>
            <span className="font-semibold">Team Portal</span>
          </div>
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
