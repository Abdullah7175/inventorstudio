import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, FolderOpen, MessageSquare, User, LogOut, Settings, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import ThemeSwitcher from './ThemeSwitcher';
import { InventorDesignStudioLogo } from '@/assets/logo';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Enable 5-minute session timeout
  useSessionTimeout(5);

  const sidebarItems = [
    { label: "Dashboard", href: "/client-portal", icon: Home },
    { label: "My Projects", href: "/client-portal/projects", icon: FolderOpen },
    { label: "Messages", href: "/client-portal/messages", icon: MessageSquare },
    { label: "Profile", href: "/client-portal/profile", icon: User },
    { label: "Settings", href: "/client-portal/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/client-portal" && location === "/client-portal") return true;
    if (href !== "/client-portal" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">I</span>
            </div>
            <div>
              <div className="text-lg font-bold text-white">Client Portal</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-gray-800 border-r border-gray-700 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href="/">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-black font-bold text-sm">I</span>
                </div>
              </Link>
              <div>
                <div className="text-lg font-bold text-white">Client Portal</div>
                <div className="text-xs text-gray-400">Inventor Design Studio</div>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-6 px-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-black" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {(user as any)?.firstName || "User"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {(user as any)?.email || "user@example.com"}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-6 flex-1 px-2 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive(item.href)
                          ? "bg-primary text-black"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? "text-black" : "text-gray-400 group-hover:text-gray-300"
                      }`} />
                      {item.label}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="px-2 pb-4">
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start text-gray-300 hover:text-red-400 hover:bg-red-900/20"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="absolute inset-0 bg-gray-600 opacity-75" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-sm">I</span>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">Client Portal</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Mobile User Info */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {(user as any)?.firstName || "User"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {(user as any)?.email || "user@example.com"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 p-2 space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          whileHover={{ x: 4 }}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            isActive(item.href)
                              ? "bg-primary text-black"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className={`mr-3 h-5 w-5 ${
                            isActive(item.href) ? "text-black" : "text-gray-400 group-hover:text-gray-300"
                          }`} />
                          {item.label}
                        </motion.div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile Logout */}
                <div className="p-2 border-t border-gray-700">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full justify-start text-gray-300 hover:text-red-400 hover:bg-red-900/20"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {(user as any)?.firstName || "User"}!
                </h1>
                <p className="text-gray-400">Manage your projects and track progress</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Bell className="h-5 w-5" />
                </Button>
                <ThemeSwitcher />
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 p-6 bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
