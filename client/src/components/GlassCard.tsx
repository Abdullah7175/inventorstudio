import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  index?: number;
}

export default function GlassCard({ 
  children, 
  className = "", 
  hover = true, 
  gradient = false,
  index = 0 
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut" 
      }}
      whileHover={hover ? { 
        y: -8, 
        scale: 1.02,
        rotateY: 5,
        rotateX: 5
      } : {}}
      viewport={{ once: true }}
      className={`
        relative overflow-hidden rounded-2xl
        bg-background/40 backdrop-blur-xl
        border border-border/50
        shadow-xl shadow-black/10
        transition-all duration-500
        ${hover ? "hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30" : ""}
        ${gradient ? "bg-gradient-to-br from-background/60 to-background/20" : ""}
        ${className}
      `}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
    >
      {/* Animated background gradient */}
      {gradient && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100"
          initial={false}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      
      {/* Shimmer effect */}
      {hover && (
        <motion.div
          className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "linear-gradient(135deg, transparent 30%, rgba(214, 255, 42, 0.1) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
}