import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "text" | "avatar" | "button" | "table";
  count?: number;
  animated?: boolean;
}

export default function LoadingSkeleton({ 
  className, 
  variant = "text", 
  count = 1, 
  animated = true 
}: LoadingSkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "card":
        return "h-32 w-full rounded-lg";
      case "text":
        return "h-4 w-full rounded";
      case "avatar":
        return "h-10 w-10 rounded-full";
      case "button":
        return "h-10 w-24 rounded-md";
      case "table":
        return "h-12 w-full rounded";
      default:
        return "h-4 w-full rounded";
    }
  };

  const shimmerAnimation = {
    initial: { x: "-100%" },
    animate: { x: "100%" },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseAnimation = {
    initial: { opacity: 0.5 },
    animate: { opacity: 1 },
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  };

  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <motion.div
      key={index}
      className={cn(
        "relative overflow-hidden bg-muted/60",
        getVariantStyles(),
        className
      )}
      {...(animated ? pulseAnimation : {})}
    >
      {animated && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          {...shimmerAnimation}
        />
      )}
    </motion.div>
  ));

  if (variant === "card") {
    return (
      <div className="space-y-4">
        {skeletonItems.map((item, index) => (
          <div key={index} className="space-y-3">
            {item}
            <div className="space-y-2">
              <LoadingSkeleton variant="text" className="h-3 w-3/4" animated={animated} />
              <LoadingSkeleton variant="text" className="h-3 w-1/2" animated={animated} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-2">
        {skeletonItems}
      </div>
    );
  }

  return count === 1 ? skeletonItems[0] : <div className="space-y-2">{skeletonItems}</div>;
}

// Specialized skeleton components
export function BlogPostSkeleton() {
  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <div className="flex items-center space-x-4">
        <LoadingSkeleton variant="avatar" />
        <div className="space-y-2 flex-1">
          <LoadingSkeleton variant="text" className="h-4 w-1/4" />
          <LoadingSkeleton variant="text" className="h-3 w-1/6" />
        </div>
      </div>
      <LoadingSkeleton variant="text" className="h-6 w-3/4" />
      <LoadingSkeleton variant="text" className="h-4 w-full" />
      <LoadingSkeleton variant="text" className="h-4 w-5/6" />
      <div className="flex space-x-2 pt-2">
        <LoadingSkeleton variant="button" className="h-8 w-16" />
        <LoadingSkeleton variant="button" className="h-8 w-16" />
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <LoadingSkeleton variant="card" className="h-40" />
      <div className="space-y-2">
        <LoadingSkeleton variant="text" className="h-5 w-3/4" />
        <LoadingSkeleton variant="text" className="h-4 w-full" />
        <LoadingSkeleton variant="text" className="h-4 w-2/3" />
      </div>
      <div className="flex justify-between items-center">
        <LoadingSkeleton variant="text" className="h-4 w-1/4" />
        <LoadingSkeleton variant="button" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <LoadingSkeleton variant="text" className="h-8 w-1/3" />
        <LoadingSkeleton variant="button" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <LoadingSkeleton variant="text" className="h-4 w-1/2" />
            <LoadingSkeleton variant="text" className="h-8 w-3/4" />
          </div>
        ))}
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingSkeleton variant="card" className="h-64" />
        <LoadingSkeleton variant="card" className="h-64" />
      </div>
    </div>
  );
}