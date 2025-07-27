import { motion } from "framer-motion";
import { 
  Code, 
  Smartphone, 
  Palette, 
  Megaphone, 
  Server, 
  Camera,
  Layers,
  Zap,
  Globe,
  Shield
} from "lucide-react";

interface ServiceBackgroundElementsProps {
  density?: "light" | "medium" | "heavy";
  opacity?: number;
}

export default function ServiceBackgroundElements({ 
  density = "medium", 
  opacity = 0.05 
}: ServiceBackgroundElementsProps) {
  const serviceIcons = [
    { icon: Code, label: "Web Development" },
    { icon: Smartphone, label: "Mobile Apps" },
    { icon: Palette, label: "UI/UX Design" },
    { icon: Megaphone, label: "Digital Marketing" },
    { icon: Server, label: "DevOps" },
    { icon: Camera, label: "Video Production" },
    { icon: Layers, label: "Graphic Design" },
    { icon: Zap, label: "Automation" },
    { icon: Globe, label: "Web Hosting" },
    { icon: Shield, label: "Security" },
  ];

  const densityConfig = {
    light: 8,
    medium: 15,
    heavy: 25
  };

  const elementCount = densityConfig[density];

  const generateElements = () => {
    const elements = [];
    for (let i = 0; i < elementCount; i++) {
      const service = serviceIcons[i % serviceIcons.length];
      const Icon = service.icon;
      
      elements.push(
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: opacity,
          }}
          initial={{ 
            scale: 0,
            rotate: 0,
            opacity: 0
          }}
          animate={{ 
            scale: [0, 1, 0.8, 1],
            rotate: [0, 360],
            opacity: [0, opacity, opacity, 0]
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "easeInOut"
          }}
        >
          <Icon 
            className="text-primary" 
            size={24 + Math.random() * 32}
          />
        </motion.div>
      );
    }
    return elements;
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {generateElements()}
      
      {/* Floating geometric shapes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`geo-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, opacity * 0.5, 0],
            scale: [0, 1, 0],
            rotate: [0, 360],
            x: [0, Math.random() * 200 - 100],
            y: [0, Math.random() * 200 - 100],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        >
          <div 
            className="bg-primary rounded-full"
            style={{
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
            }}
          />
        </motion.div>
      ))}

      {/* Code-like patterns */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={`code-${i}`}
          className="absolute pointer-events-none font-mono text-primary"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${10 + Math.random() * 8}px`,
            opacity: opacity * 0.6,
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, opacity * 0.6, 0],
            y: [0, -50],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut"
          }}
        >
          {['</>','{}','[]','()','&&','||','==='][Math.floor(Math.random() * 7)]}
        </motion.div>
      ))}
    </div>
  );
}

// Specialized components for different sections
export function HeroBackgroundElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large floating service icons */}
      {[Code, Smartphone, Palette, Megaphone].map((Icon, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${20 + i * 20}%`,
            top: `${30 + (i % 2) * 40}%`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ 
            opacity: [0, 0.1, 0.05],
            scale: [0, 1, 0.8],
            rotate: [0, 360],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        >
          <Icon size={60 + i * 20} className="text-primary" />
        </motion.div>
      ))}

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <motion.path
          d="M 100 200 Q 300 100 500 200 T 900 200"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
          d="M 200 400 Q 400 300 600 400 T 1000 400"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
        />
      </svg>
    </div>
  );
}

export function ServicesBackgroundPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
      {/* Grid pattern */}
      <div className="absolute inset-0">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(214, 255, 42, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(214, 255, 42, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Service workflow visualization */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-1/2 h-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
      >
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <motion.circle
            cx="50" cy="50" r="20"
            fill="currentColor"
            className="text-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle
            cx="200" cy="50" r="20"
            fill="currentColor"
            className="text-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <motion.circle
            cx="350" cy="50" r="20"
            fill="currentColor"
            className="text-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
          <motion.path
            d="M70 50 L180 50"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.path
            d="M220 50 L330 50"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}