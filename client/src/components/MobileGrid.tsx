import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MobileGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export default function MobileGrid({
  children,
  columns = 2,
  gap = "md",
  className = "",
}: MobileGridProps) {
  const gridClasses = {
    1: "responsive-grid-1",
    2: "responsive-grid-2", 
    3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "responsive-grid",
  };

  const gapClasses = {
    sm: "gap-2 sm:gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8 lg:gap-10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, staggerChildren: 0.1 }}
      className={`
        ${gridClasses[columns]}
        ${gapClasses[gap]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}