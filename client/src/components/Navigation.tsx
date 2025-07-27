import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
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
    { label: "Recommendations", href: "/recommendations" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-background border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <div className="text-2xl font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity">
              Inventer Design Studio
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`transition-colors duration-300 cursor-pointer ${
                    isActive(item.href)
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex space-x-4 items-center">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {(user as any)?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-black">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/client-portal">
                  <Button className="bg-primary text-black hover:bg-primary/80 glow-animation">
                    Portal
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "/api/logout")}
                  className="border-primary text-primary hover:bg-primary hover:text-black"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = "/api/login")}
                className="bg-primary text-black hover:bg-primary/80 glow-animation"
              >
                Client Portal
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden text-primary">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-border">
              <div className="flex flex-col space-y-6 mt-8">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span
                      onClick={() => setIsOpen(false)}
                      className={`block text-lg transition-colors duration-300 cursor-pointer ${
                        isActive(item.href)
                          ? "text-primary"
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
                
                <div className="border-t border-border pt-6 space-y-4">
                  <div className="flex justify-center">
                    <ThemeToggle />
                  </div>
                  {isAuthenticated ? (
                    <>
                      {(user as any)?.role === "admin" && (
                        <Link href="/admin">
                          <Button 
                            variant="outline" 
                            className="w-full border-primary text-primary hover:bg-primary hover:text-black"
                            onClick={() => setIsOpen(false)}
                          >
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                      <Link href="/client-portal">
                        <Button 
                          className="w-full bg-primary text-black hover:bg-primary/80"
                          onClick={() => setIsOpen(false)}
                        >
                          Client Portal
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-black"
                        onClick={() => {
                          setIsOpen(false);
                          window.location.href = "/api/logout";
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full bg-primary text-black hover:bg-primary/80"
                      onClick={() => {
                        setIsOpen(false);
                        window.location.href = "/api/login";
                      }}
                    >
                      Client Portal
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
