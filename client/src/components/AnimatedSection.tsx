import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export default function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0,
  id
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
      className={className}
      id={id}
    >
      {children}
    </motion.div>
  );
}
