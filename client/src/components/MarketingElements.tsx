import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Users, 
  Eye, 
  Heart,
  Share2,
  MessageCircle,
  Zap,
  Globe
} from "lucide-react";

export default function MarketingElements() {
  const marketingIcons = [
    { icon: TrendingUp, label: "Growth" },
    { icon: Target, label: "Targeting" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Users, label: "Audience" },
    { icon: Eye, label: "Visibility" },
    { icon: Heart, label: "Engagement" },
    { icon: Share2, label: "Social" },
    { icon: MessageCircle, label: "Content" },
    { icon: Zap, label: "Performance" },
    { icon: Globe, label: "Reach" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-4">
      {/* Floating marketing icons */}
      {marketingIcons.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            className="absolute"
            style={{
              left: `${(index * 23 + 10) % 90}%`,
              top: `${(index * 19 + 15) % 85}%`,
            }}
            initial={{ 
              opacity: 0,
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              opacity: [0, 0.4, 0.2, 0.4, 0],
              scale: [0, 1.2, 0.8, 1, 0],
              rotate: [0, 180, 360],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 12 + index * 1.5,
              repeat: Infinity,
              delay: index * 0.8,
              ease: "easeInOut"
            }}
          >
            <Icon className="text-primary" size={28 + (index % 4) * 8} />
          </motion.div>
        );
      })}

      {/* Marketing funnel visualization */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-32 h-48"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full text-primary">
          <motion.polygon
            points="10,10 90,10 80,40 20,40"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1 }}
          />
          <motion.polygon
            points="20,40 80,40 70,70 30,70"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.5 }}
          />
          <motion.polygon
            points="30,70 70,70 60,100 40,100"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 2 }}
          />
        </svg>
      </motion.div>

      {/* Analytics charts */}
      <motion.div
        className="absolute bottom-1/4 left-1/6 w-24 h-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        <svg viewBox="0 0 80 40" className="w-full h-full text-primary">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.rect
              key={i}
              x={i * 12 + 5}
              y={40 - (i * 3 + 10)}
              width="8"
              height={i * 3 + 10}
              fill="currentColor"
              fillOpacity="0.3"
              initial={{ height: 0 }}
              animate={{ height: i * 3 + 10 }}
              transition={{ duration: 1, delay: i * 0.2 }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Social media engagement indicators */}
      {['💬', '👍', '📤', '👀', '📊'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-lg opacity-20"
          style={{
            left: `${(i * 18 + 5) % 95}%`,
            top: `${(i * 25 + 60) % 40 + 60}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.2, 0],
            scale: [0, 1.5, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "easeInOut"
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Growth arrow */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0, 0.3, 0],
          scale: [0, 1, 0],
          rotate: [0, 45, 90],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <TrendingUp size={48} className="text-primary" />
      </motion.div>
    </div>
  );
}