import { ReactNode } from "react";

interface MobileGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export default function MobileGrid({ 
  children, 
  columns = 1, 
  gap = "md", 
  className = "" 
}: MobileGridProps) {
  const gapClasses = {
    sm: "gap-2 sm:gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8"
  };

  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  };

  return (
    <div className={`
      grid 
      ${columnClasses[columns]} 
      ${gapClasses[gap]}
      w-full
      ${className}
    `}>
      {children}
    </div>
  );
}