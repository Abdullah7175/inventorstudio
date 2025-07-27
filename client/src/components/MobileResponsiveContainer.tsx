import { ReactNode } from "react";

interface MobileResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export default function MobileResponsiveContainer({ 
  children, 
  className = "" 
}: MobileResponsiveContainerProps) {
  return (
    <div className={`mobile-container ${className}`}>
      {children}
    </div>
  );
}