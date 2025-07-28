// Company Logo Component for Inventor Design Studio
export function InventorDesignStudioLogo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-primary rounded-lg flex items-center justify-center`}>
        <span className="text-black font-bold text-xs">IDS</span>
      </div>
      <span className="font-bold text-foreground whitespace-nowrap">
        Inventor Design Studio
      </span>
    </div>
  );
}

// Simplified logo for small spaces
export function IDSLogoSimple({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm", 
    lg: "w-12 h-12 text-base"
  };

  return (
    <div className={`${sizeClasses[size]} bg-primary rounded-lg flex items-center justify-center ${className}`}>
      <span className="text-black font-bold">IDS</span>
    </div>
  );
}