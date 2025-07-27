import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import AnimatedSection from "@/components/AnimatedSection";
import ServiceBackgroundElements from "@/components/ServiceBackgroundElements";
import MarketingElements from "@/components/MarketingElements";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { type BlogPost } from "@shared/schema";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const response = await fetch("/api/blog?published=true");
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      return response.json();
    },
  });

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Blog background elements */}
      <ServiceBackgroundElements density="light" opacity={0.04} />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Stay updated with the latest trends, tips, and insights from the world of digital design and development.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-border focus:border-primary"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? "No articles found matching your search." : "No blog posts available at the moment. Please check back later."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-900 bg-opacity-30">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stay <span className="gradient-text">Updated</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Subscribe to our newsletter to get the latest articles and insights delivered directly to your inbox.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-border focus:border-primary"
              />
              <button className="bg-primary text-black px-6 py-2 rounded-lg font-semibold hover:bg-primary/80 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
