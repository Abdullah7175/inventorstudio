import { motion } from "framer-motion";
import { 
  FaReact, 
  FaNodeJs, 
  FaPython, 
  FaAws, 
  FaDocker, 
  FaGitAlt,
  FaFigma,
  FaWordpress
} from "react-icons/fa";
import { 
  SiTypescript, 
  SiNextdotjs, 
  SiTailwindcss, 
  SiMongodb, 
  SiPostgresql,
  SiFirebase,
  SiVercel,
  SiStripe,
  SiGooglecloud,
  SiKubernetes
} from "react-icons/si";

export default function TechStackBackground() {
  const techIcons = [
    { icon: FaReact, color: "#61DAFB", name: "React" },
    { icon: FaNodeJs, color: "#339933", name: "Node.js" },
    { icon: SiTypescript, color: "#3178C6", name: "TypeScript" },
    { icon: SiNextdotjs, color: "#000000", name: "Next.js" },
    { icon: SiTailwindcss, color: "#06B6D4", name: "Tailwind" },
    { icon: FaPython, color: "#3776AB", name: "Python" },
    { icon: SiMongodb, color: "#47A248", name: "MongoDB" },
    { icon: SiPostgresql, color: "#336791", name: "PostgreSQL" },
    { icon: FaAws, color: "#FF9900", name: "AWS" },
    { icon: SiGooglecloud, color: "#4285F4", name: "Google Cloud" },
    { icon: FaDocker, color: "#2496ED", name: "Docker" },
    { icon: SiKubernetes, color: "#326CE5", name: "Kubernetes" },
    { icon: FaFigma, color: "#F24E1E", name: "Figma" },
    { icon: SiFirebase, color: "#FFCA28", name: "Firebase" },
    { icon: SiVercel, color: "#000000", name: "Vercel" },
    { icon: SiStripe, color: "#635BFF", name: "Stripe" },
    { icon: FaGitAlt, color: "#F05032", name: "Git" },
    { icon: FaWordpress, color: "#21759B", name: "WordPress" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
      {techIcons.map((tech, index) => {
        const Icon = tech.icon;
        return (
          <motion.div
            key={tech.name}
            className="absolute"
            style={{
              left: `${(index * 17) % 100}%`,
              top: `${(index * 23) % 100}%`,
              color: tech.color,
            }}
            initial={{ 
              opacity: 0,
              scale: 0,
              rotate: -180 
            }}
            animate={{ 
              opacity: [0, 0.6, 0.3, 0.6, 0],
              scale: [0, 1, 0.8, 1, 0],
              rotate: [0, 360],
              x: [0, Math.sin(index) * 50],
              y: [0, Math.cos(index) * 30],
            }}
            transition={{
              duration: 15 + (index % 5) * 2,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut"
            }}
          >
            <Icon size={32 + (index % 3) * 16} />
          </motion.div>
        );
      })}

      {/* Connecting network lines */}
      <svg className="absolute inset-0 w-full h-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.line
            key={i}
            x1={`${(i * 20) % 100}%`}
            y1={`${(i * 30) % 100}%`}
            x2={`${((i + 1) * 25) % 100}%`}
            y2={`${((i + 1) * 35) % 100}%`}
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary opacity-20"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>

      {/* Floating code snippets */}
      {[
        "const app = () =>",
        "async function",
        "import React",
        "export default",
        "useState()",
        "useEffect()",
        ".map(item =>",
        "=> { return",
      ].map((code, i) => (
        <motion.div
          key={code}
          className="absolute font-mono text-xs text-primary opacity-30"
          style={{
            left: `${(i * 30 + 10) % 90}%`,
            top: `${(i * 25 + 15) % 80}%`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: [0, 0.3, 0],
            y: [20, -40, -80],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            delay: i * 2,
            ease: "easeOut"
          }}
        >
          {code}
        </motion.div>
      ))}
    </div>
  );
}