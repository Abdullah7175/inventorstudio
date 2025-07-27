import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { type BlogPost } from "@shared/schema";
import { Link } from "wouter";

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export default function BlogCard({ post, index }: BlogCardProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`}>
        <Card className="glass-effect border-border hover:border-primary/50 transition-all duration-300 overflow-hidden cursor-pointer h-full">
          {post.imageUrl && (
            <div className="relative overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
          
          <CardContent className="p-6">
            <div className="flex items-center text-primary text-sm mb-3">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(post.publishedAt)}
            </div>
            
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            
            <motion.div
              whileHover={{ x: 5 }}
              className="flex items-center text-primary font-medium"
            >
              Read More
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
