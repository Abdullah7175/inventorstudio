import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { X, ChevronRight, Home, Info, Briefcase, FileText, Phone, Users, Shield, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isAuthenticated } = useAuth();

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/services", label: "Services", icon: Briefcase },
    { href: "/portfolio", label: "Portfolio", icon: FileText },
    { href: "/blog", label: "Blog", icon: FileText },
    { href: "/contact", label: "Contact", icon: Phone },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
  ];

  const authenticatedItems = [
    { href: "/client-portal", label: "Client Portal", icon: Users },
    { href: "/admin-portal", label: "Admin Portal", icon: Shield },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Mobile Menu */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed top-0 right-0 h-full w-80 bg-background/95 backdrop-blur-xl border-l border-border z-50 safe-area-inset"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="text-xl font-bold gradient-text">
                  Inventer Design
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors touch-target"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-2 px-6">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link href={item.href}>
                          <motion.div
                            whileHover={{ x: 8 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 group cursor-pointer touch-target"
                          >
                            <div className="flex items-center space-x-4">
                              <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Authenticated User Items */}
                  {isAuthenticated && (
                    <>
                      <div className="border-t border-border my-4" />
                      <div className="text-sm font-semibold text-muted-foreground px-4 mb-3">
                        Account
                      </div>
                      {authenticatedItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (menuItems.length + index) * 0.1 }}
                          >
                            <Link href={item.href}>
                              <motion.div
                                whileHover={{ x: 8 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 group cursor-pointer touch-target"
                              >
                                <div className="flex items-center space-x-4">
                                  <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                  <span className="font-medium">{item.label}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              </motion.div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </>
                  )}
                </nav>
              </div>

              {/* Footer */}
              <div className="border-t border-border p-6">
                {!isAuthenticated ? (
                  <motion.a
                    href="/api/login"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block w-full bg-primary text-black text-center py-3 px-6 rounded-xl font-semibold hover:bg-primary/80 transition-all duration-300 touch-target"
                  >
                    Sign In
                  </motion.a>
                ) : (
                  <motion.a
                    href="/api/logout"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block w-full border border-primary text-primary text-center py-3 px-6 rounded-xl font-semibold hover:bg-primary hover:text-black transition-all duration-300 touch-target"
                  >
                    Sign Out
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}