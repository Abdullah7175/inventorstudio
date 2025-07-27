import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
  index: number;
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      className="group cursor-pointer"
    >
      <Card className="glass-effect border-border hover:border-primary/50 transition-all duration-300 h-full">
        <CardContent className="p-8">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="text-primary text-4xl mb-4 group-hover:animate-bounce"
          >
            <i className={service.icon}></i>
          </motion.div>
          
          <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
            {service.title}
          </h3>
          
          <p className="text-muted-foreground mb-6">
            {service.description}
          </p>
          
          {service.technologies && service.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {service.technologies.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="bg-primary/20 text-primary hover:bg-primary hover:text-black transition-colors"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
