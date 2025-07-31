import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Home, 
  Info, 
  Briefcase, 
  FolderOpen, 
  MessageSquare, 
  HelpCircle,
  Settings,
  Users,
  UserCircle,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle } from "@/lib/firebase";

export default function MobileNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const publicNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/services", label: "Services", icon: Briefcase },
    { href: "/portfolio", label: "Portfolio", icon: FolderOpen },
    { href: "/blog", label: "Blog", icon: MessageSquare },
    { href: "/contact", label: "Contact", icon: MessageSquare },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
  ];

  const authenticatedNavItems = [
    ...publicNavItems,
    { href: "/client-portal", label: "Client Portal", icon: UserCircle },
    { href: "/projects", label: "Projects", icon: Settings },
    { href: "/admin", label: "Admin", icon: Shield },
    { href: "/team", label: "Team", icon: Users },
  ];

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;

  const isActiveLink = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? 'bg-black/95 backdrop-blur-xl' : 'bg-black/80 backdrop-blur-md'}
        border-b border-primary/20
      `}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary"
              >
                <span className="text-sm sm:text-base font-bold text-black">I</span>
              </motion.div>
              <span className="hidden sm:block font-bold text-primary text-sm lg:text-base">
                Inventer Design Studio
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                      ${isActiveLink(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      }
                    `}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Auth & Mobile Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="hidden sm:flex items-center space-x-3">
                      <span className="text-xs lg:text-sm text-muted-foreground truncate max-w-20 lg:max-w-none">
                        {(user as any)?.firstName || (user as any)?.email?.split('@')[0]}
                      </span>
                      <Button variant="outline" size="sm" onClick={logout} className="text-xs">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => signInWithGoogle()} className="hidden sm:inline-flex text-xs">
                      Sign In
                    </Button>
                  )}
                </>
              )}
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden touch-target p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </motion.div>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-black/95 backdrop-blur-xl border-l border-primary/20 z-50 lg:hidden"
            >
              <div className="flex flex-col h-full mobile-safe-area">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-primary/20">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <span className="text-sm font-bold text-black">I</span>
                    </div>
                    <span className="font-bold text-primary text-sm">Inventer Design</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="touch-target p-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {navItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={item.href}
                            className={`
                              flex items-center w-full p-3 rounded-lg transition-all duration-200
                              ${isActiveLink(item.href)
                                ? "text-primary bg-primary/10 border-l-2 border-primary"
                                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                              }
                            `}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Auth Section */}
                {!isLoading && (
                  <div className="p-4 border-t border-primary/20">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Welcome, {(user as any)?.firstName || (user as any)?.email?.split('@')[0]}
                        </div>
                        <Button variant="outline" size="sm" onClick={logout} className="w-full">
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => signInWithGoogle()} className="w-full">
                        Sign In with Google
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}