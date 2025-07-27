import { motion } from "framer-motion";
import { 
  Brush, 
  Palette, 
  Layers, 
  Grid, 
  Square, 
  Circle,
  Triangle,
  Hexagon,
  Star,
  Zap
} from "lucide-react";

export default function DesignElements() {
  const designShapes = [
    { icon: Square, color: "#D6FF2A" },
    { icon: Circle, color: "#A3D61C" },
    { icon: Triangle, color: "#D6FF2A" },
    { icon: Hexagon, color: "#8BC34A" },
    { icon: Star, color: "#D6FF2A" },
  ];

  const designIcons = [
    { icon: Brush, label: "Design" },
    { icon: Palette, label: "Colors" },
    { icon: Layers, label: "Layers" },
    { icon: Grid, label: "Layout" },
    { icon: Zap, label: "Creative" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-6">
      {/* Floating geometric shapes */}
      {designShapes.map((shape, index) => {
        const Shape = shape.icon;
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: `${(index * 15 + 10) % 85}%`,
              top: `${(index * 20 + 15) % 80}%`,
              color: shape.color,
            }}
            initial={{ 
              opacity: 0,
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              opacity: [0, 0.6, 0.3, 0.6, 0],
              scale: [0, 1.5, 1, 1.2, 0],
              rotate: [0, 180, 360],
              x: [0, Math.sin(index * 2) * 30],
              y: [0, Math.cos(index * 2) * 20],
            }}
            transition={{
              duration: 10 + index * 2,
              repeat: Infinity,
              delay: index * 1.5,
              ease: "easeInOut"
            }}
          >
            <Shape size={40 + (index % 3) * 20} />
          </motion.div>
        );
      })}

      {/* Design tool icons */}
      {designIcons.map((tool, index) => {
        const Icon = tool.icon;
        return (
          <motion.div
            key={tool.label}
            className="absolute text-primary"
            style={{
              left: `${(index * 25 + 20) % 90}%`,
              top: `${(index * 18 + 25) % 75}%`,
            }}
            initial={{ 
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              opacity: [0, 0.4, 0.2, 0.4, 0],
              scale: [0, 1, 0.8, 1, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 8 + index * 1.5,
              repeat: Infinity,
              delay: index * 2,
              ease: "easeInOut"
            }}
          >
            <Icon size={32 + (index % 2) * 16} />
          </motion.div>
        );
      })}

      {/* Color palette visualization */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-20 h-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
      >
        <div className="grid grid-cols-4 gap-1 h-full">
          {['#D6FF2A', '#A3D61C', '#8BC34A', '#689F0F', '#D6FF2A', '#FFD700', '#FF6B6B', '#4ECDC4'].map((color, i) => (
            <motion.div
              key={i}
              className="rounded-sm"
              style={{ backgroundColor: color }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0.8, 1] }}
              transition={{ 
                duration: 0.5, 
                delay: i * 0.1,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 3
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Creative sparks */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary rounded-full"
          style={{
            left: `${(i * 12 + 5) % 95}%`,
            top: `${(i * 17 + 10) % 90}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 2, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Design grid pattern */}
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-24 h-24 opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 3 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i}>
              <motion.line
                x1={i * 20}
                y1="0"
                x2={i * 20}
                y2="100"
                stroke="currentColor"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.2 }}
              />
              <motion.line
                x1="0"
                y1={i * 20}
                x2="100"
                y2={i * 20}
                stroke="currentColor"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.2 + 0.5 }}
              />
            </g>
          ))}
        </svg>
      </motion.div>
    </div>
  );
}