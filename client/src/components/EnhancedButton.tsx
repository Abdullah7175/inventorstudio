import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EnhancedButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  className?: string;
  onClick?: () => void;
  href?: string;
  magnetic?: boolean;
  glow?: boolean;
}

export default function EnhancedButton({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "right",
  className = "",
  onClick,
  href,
  magnetic = false,
  glow = false,
}: EnhancedButtonProps) {
  const baseClasses = "relative overflow-hidden transition-all duration-300 group";
  
  const variantClasses = {
    primary: "bg-primary text-black hover:bg-primary/80",
    secondary: "bg-muted text-foreground hover:bg-muted/80",
    outline: "border border-primary text-primary hover:bg-primary hover:text-black",
    ghost: "text-foreground hover:bg-muted/50",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${magnetic ? "btn-magnetic" : ""}
    ${glow ? "glow-animation" : ""}
    ${className}
  `.trim();

  const buttonContent = (
    <>
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center space-x-2">
        {Icon && iconPosition === "left" && (
          <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
        )}
        <span>{children}</span>
        {Icon && iconPosition === "right" && (
          <Icon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={{ scale: magnetic ? 1.05 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={combinedClasses}
      >
        {buttonContent}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: magnetic ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={combinedClasses}
    >
      {buttonContent}
    </motion.button>
  );
}