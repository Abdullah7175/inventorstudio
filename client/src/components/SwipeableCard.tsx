import { useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { ReactNode } from "react";

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = "",
  disabled = false,
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (disabled) return;

    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  return (
    <motion.div
      className={`touch-pan-y gpu-accelerated ${className}`}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      animate={{
        scale: isDragging ? 0.95 : 1,
        rotateZ: isDragging ? Math.random() * 4 - 2 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{
        touchAction: disabled ? "auto" : "pan-y",
      }}
    >
      {children}
      
      {/* Swipe indicators */}
      {!disabled && (isDragging || (onSwipeLeft || onSwipeRight)) && (
        <>
          {onSwipeRight && (
            <motion.div
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isDragging ? 1 : 0, x: isDragging ? 0 : -20 }}
            >
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                →
              </div>
            </motion.div>
          )}
          
          {onSwipeLeft && (
            <motion.div
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isDragging ? 1 : 0, x: isDragging ? 0 : 20 }}
            >
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                ←
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}