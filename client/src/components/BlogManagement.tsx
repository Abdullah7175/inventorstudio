import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BlogEditor from "./BlogEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Calendar,
  Clock,
  FileText
} from "lucide-react";
import { type BlogPost } from "@shared/schema";
import { format } from "date-fns";

export default function BlogManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/blog/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  const filteredPosts = posts.filter((post: BlogPost) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "published") return matchesSearch && post.published;
    if (statusFilter === "draft") return matchesSearch && !post.published;
    
    return matchesSearch;
  });

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingPost(undefined);
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    setEditingPost(undefined);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingPost(undefined);
  };

  const handleDelete = (post: BlogPost) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      deleteMutation.mutate(post.id);
    }
  };

  if (isEditing) {
    return (
      <BlogEditor
        post={editingPost}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Blog Management</h2>
          <p className="text-gray-400">Create and manage blog posts for SEO optimization</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#D6FF2A] text-black hover:bg-[#D6FF2A]/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-black/20 border-[#D9D9D9]/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/40 border-[#D9D9D9]/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "bg-[#D6FF2A] text-black" : "text-white border-[#D9D9D9]/20"}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "published" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("published")}
                className={statusFilter === "published" ? "bg-[#D6FF2A] text-black" : "text-white border-[#D9D9D9]/20"}
              >
                Published
              </Button>
              <Button
                variant={statusFilter === "draft" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("draft")}
                className={statusFilter === "draft" ? "bg-[#D6FF2A] text-black" : "text-white border-[#D9D9D9]/20"}
              >
                Drafts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D6FF2A] mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading posts...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="bg-black/20 border-[#D9D9D9]/20">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No posts found</h3>
              <p>
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Create your first blog post to get started"
                }
              </p>
            </div>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={handleCreate} className="bg-[#D6FF2A] text-black hover:bg-[#D6FF2A]/90">
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post: BlogPost) => (
            <Card key={post.id} className="bg-black/20 border-[#D9D9D9]/20 hover:border-[#D6FF2A]/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-white text-lg line-clamp-2">{post.title}</CardTitle>
                  <Badge variant={post.published ? "default" : "secondary"}>
                    {post.published ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Live
                      </>
                    ) : (
                      "Draft"
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm line-clamp-3">{post.excerpt}</p>
                
                {post.featuredImage && (
                  <div className="aspect-video rounded-md overflow-hidden bg-black/40">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {post.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags && post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Not published'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime || 5} min read
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(post)}
                    className="flex-1 text-white border-[#D9D9D9]/20 hover:bg-[#D6FF2A]/10"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(post)}
                    className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}