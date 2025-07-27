import { motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface MobileOptimizedButtonProps extends ButtonProps {
  children: ReactNode;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  loading?: boolean;
}

const MobileOptimizedButton = forwardRef<HTMLButtonElement, MobileOptimizedButtonProps>(
  ({ children, icon: Icon, iconPosition = "left", fullWidth, loading, className = "", ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="gpu-accelerated"
      >
        <Button
          ref={ref}
          className={`
            btn-mobile focus-ring gpu-accelerated
            ${fullWidth ? 'w-full' : ''}
            ${loading ? 'opacity-70 cursor-not-allowed' : ''}
            ${className}
          `}
          disabled={loading || props.disabled}
          {...props}
        >
          <div className="flex items-center justify-center gap-2">
            {Icon && iconPosition === "left" && (
              <motion.div
                animate={loading ? { rotate: 360 } : {}}
                transition={loading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </motion.div>
            )}
            
            <span className="font-medium">{children}</span>
            
            {Icon && iconPosition === "right" && (
              <motion.div
                animate={loading ? { rotate: 360 } : {}}
                transition={loading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </motion.div>
            )}
          </div>
        </Button>
      </motion.div>
    );
  }
);

MobileOptimizedButton.displayName = "MobileOptimizedButton";

export default MobileOptimizedButton;