import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}

export default function ResponsiveLayout({
  children,
  className = "",
  maxWidth = "2xl",
  padding = true,
}: ResponsiveLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`
        w-full mx-auto 
        ${maxWidthClasses[maxWidth]}
        ${padding ? "responsive-padding" : ""}
        ${className}
      `}
    >
      <div className="mobile-safe-area">
        {children}
      </div>
    </motion.div>
  );
}