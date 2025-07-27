import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EnhancedMobileCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
  variant?: "default" | "featured" | "compact";
}

export default function EnhancedMobileCard({
  title,
  description,
  icon: Icon,
  children,
  className = "",
  onClick,
  delay = 0,
  variant = "default",
}: EnhancedMobileCardProps) {
  const variants = {
    default: "card-mobile",
    featured: "card-mobile bg-primary/5 border-primary/40",
    compact: "p-3 sm:p-4 rounded-lg glass-effect border border-primary/20 hover-lift transition-all duration-300"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="gpu-accelerated"
    >
      <Card 
        className={`${variants[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        <CardHeader className={variant === "compact" ? "pb-2" : "pb-4"}>
          <div className="flex items-start gap-3">
            {Icon && (
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="flex-shrink-0"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                </div>
              </motion.div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className={variant === "compact" ? "text-base sm:text-lg" : "mobile-subheading"}>
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="responsive-text-sm mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        {children && (
          <CardContent className={variant === "compact" ? "pt-0" : "pt-0"}>
            {children}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}