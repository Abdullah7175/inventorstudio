import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, ArrowRight, User, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import MobileMenu from "./MobileMenu";

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

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

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
            ? "glass-effect-mobile bg-background/80 backdrop-blur-xl border-b border-border shadow-lg" 
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto responsive-padding">
          <div className="flex justify-between items-center h-16 lg:h-20">
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
                  <div className="text-lg lg:text-xl font-bold gradient-text group-hover:scale-105 transition-transform">
                    Inventer Design
                  </div>
                  <div className="text-xs text-muted-foreground -mt-1">
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
                        : "text-foreground hover:text-primary hover:bg-muted/50"
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

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted/30">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {(user as any)?.firstName || "User"}
                    </span>
                  </div>

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

                  {/* Project Management */}
                  <Link href="/projects">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-300"
                    >
                      Projects
                    </Button>
                  </Link>

                  {/* Client Portal */}
                  <Link href="/client-portal">
                    <Button 
                      className="bg-primary text-black hover:bg-primary/80 transition-all duration-300 group"
                      size="sm"
                    >
                      Portal
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>

                  {/* Logout */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => (window.location.href = "/api/logout")}
                    className="text-muted-foreground hover:text-destructive transition-colors duration-300"
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
                    className="bg-primary text-black hover:bg-primary/80 glow-animation group"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-muted/50 transition-all duration-300 touch-target group"
            >
              <Menu className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            </motion.button>
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

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}