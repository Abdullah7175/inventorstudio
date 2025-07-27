import { motion } from "framer-motion";
import { ExternalLink, Calendar, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MobileOptimizedButton from "./MobileOptimizedButton";

interface MobilePortfolioCardProps {
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  category: string;
  date: string;
  liveUrl?: string;
  delay?: number;
}

export default function MobilePortfolioCard({
  title,
  description,
  image,
  technologies,
  category,
  date,
  liveUrl,
  delay = 0,
}: MobilePortfolioCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02 }}
      className="gpu-accelerated"
    >
      <Card className="card-mobile h-full overflow-hidden">
        {image && (
          <div className="relative h-48 sm:h-56 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="text-primary/30 text-6xl font-bold"
            >
              {title.charAt(0)}
            </motion.div>
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="responsive-text-xs">
                {category}
              </Badge>
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="mobile-subheading line-clamp-2">
                {title}
              </CardTitle>
              
              <div className="flex items-center gap-2 mt-2 text-muted-foreground responsive-text-xs">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>{date}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="responsive-text-sm line-clamp-3">
            {description}
          </CardDescription>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="responsive-text-xs text-muted-foreground">Technologies:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {technologies.slice(0, 4).map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: delay + index * 0.1 }}
                >
                  <Badge variant="outline" className="responsive-text-xs">
                    {tech}
                  </Badge>
                </motion.div>
              ))}
              {technologies.length > 4 && (
                <Badge variant="outline" className="responsive-text-xs">
                  +{technologies.length - 4}
                </Badge>
              )}
            </div>
          </div>

          {liveUrl && (
            <MobileOptimizedButton
              onClick={() => window.open(liveUrl, '_blank')}
              variant="outline"
              fullWidth
              icon={ExternalLink}
              iconPosition="right"
            >
              View Project
            </MobileOptimizedButton>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}