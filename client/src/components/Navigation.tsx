import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight, User, LogOut, Shield, Home, Info, Briefcase, FolderOpen, MessageSquare, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Public navigation items (always visible)
  const publicNavItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "About", href: "/about", icon: Info },
    { label: "Services", href: "/services", icon: Briefcase },
    { label: "Portfolio", href: "/portfolio", icon: FolderOpen },
    { label: "Blog", href: "/blog", icon: MessageSquare },
    { label: "Contact", href: "/contact", icon: MessageSquare },
    { label: "FAQ", href: "/faq", icon: HelpCircle },
  ];

  // Authenticated user navigation items (only when logged in)
  const authNavItems = [
    { label: "Projects", href: "/projects", icon: FolderOpen },
    { label: "Chat Test", href: "/chat-test", icon: MessageSquare },
  ];

  // Get navigation items based on authentication status
  const getNavItems = () => {
    if (!isAuthenticated) {
      return publicNavItems;
    }
    
    // For authenticated users, show public items + authenticated features
    return [...publicNavItems, ...authNavItems];
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-black/95 backdrop-blur-xl border-b border-primary/20 shadow-lg" 
            : "bg-black/80 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 cursor-pointer group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">I</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                    Inventer Design
                  </div>
                  <div className="text-xs text-gray-400 -mt-1">
                    Studio
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer group ${
                      isActive(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-white hover:text-primary hover:bg-white/5"
                    }`}
                  >
                    <span className="relative z-10 font-medium">
                      {item.label}
                    </span>
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 bg-primary/20 rounded-lg border border-primary/30"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Desktop Actions & Mobile Menu Button */}
            <div className="flex items-center space-x-3">
              {/* Desktop Actions - Only show on large screens */}
              <div className="hidden lg:flex items-center space-x-3">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    {/* User Info */}
                    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-white">
                        {(user as any)?.firstName || "User"}
                      </span>
                    </div>

                    {/* Portal Links - Role-based access */}
                    {(user as any)?.role === "client" && (
                      <Link href="/client-portal-new">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-300"
                        >
                          Client Portal
                        </Button>
                      </Link>
                    )}

                    {(user as any)?.role === "team" && (
                      <Link href="/team-portal">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-300"
                        >
                          Team Portal
                        </Button>
                      </Link>
                    )}

                    {/* Admin Portal */}
                    {(user as any)?.role === "admin" && (
                      <Link href="/admin-portal">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-300 group"
                        >
                          <Shield className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                          Admin
                        </Button>
                      </Link>
                    )}

                    {/* Logout */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (window.location.href = "/api/logout")}
                      className="text-gray-400 hover:text-red-400 transition-colors duration-300"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => (window.location.href = "/api/login")}
                      className="bg-primary text-black hover:bg-primary/80 transition-all duration-300 group"
                    >
                      Login
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-all duration-300 touch-target group"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                ) : (
                  <Menu className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Animated Border */}
        {scrolled && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        )}
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 bg-black/95 backdrop-blur-xl border-l border-primary/20 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-primary/20">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-sm">I</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">Inventer Design</div>
                    <div className="text-xs text-gray-400 -mt-1">Studio</div>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Items */}
              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-1 px-6">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${
                            isActive(item.href)
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "text-white hover:bg-white/5 hover:text-primary"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Auth Actions */}
                <div className="mt-8 px-6 space-y-4">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                        <span className="text-white font-medium">
                          {(user as any)?.firstName || "User"}
                        </span>
                      </div>
                      
                      {/* Role-based Portal Access */}
                      {(user as any)?.role === "client" && (
                        <Link href="/client-portal-new">
                          <Button 
                            className="w-full bg-primary text-black hover:bg-primary/80 transition-all duration-300"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Client Portal
                          </Button>
                        </Link>
                      )}

                      {(user as any)?.role === "team" && (
                        <Link href="/team-portal">
                          <Button 
                            className="w-full bg-primary text-black hover:bg-primary/80 transition-all duration-300"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Team Portal
                          </Button>
                        </Link>
                      )}

                      {(user as any)?.role === "admin" && (
                        <Link href="/admin-portal">
                          <Button 
                            variant="outline" 
                            className="w-full border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-300"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Portal
                          </Button>
                        </Link>
                      )}

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = "/api/logout";
                        }}
                        className="w-full text-gray-400 hover:text-red-400 transition-colors duration-300"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = "/api/login";
                      }}
                      className="w-full bg-primary text-black hover:bg-primary/80 transition-all duration-300"
                    >
                      Login
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}