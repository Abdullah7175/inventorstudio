import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MobileResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
}

export default function MobileResponsiveContainer({
  children,
  className = "",
  fullWidth = false,
  noPadding = false,
}: MobileResponsiveContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        w-full 
        ${fullWidth ? '' : 'max-w-7xl mx-auto'}
        ${noPadding ? '' : 'px-4 sm:px-6 lg:px-8'}
        ${className}
      `}
      style={{
        minHeight: 'calc(100vh - 4rem)', // Account for navigation
      }}
    >
      <div className="mobile-safe-area">
        {children}
      </div>
    </motion.div>
  );
}