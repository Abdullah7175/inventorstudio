import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  User,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type BlogPost } from "@shared/schema";
import BlogEditor from "./BlogEditor";

export default function BlogManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all blog posts
  const { data: allPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog"],
  });

  // Filter posts based on search and status
  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "published" && post.published) ||
                         (filterStatus === "draft" && !post.published);
    
    return matchesSearch && matchesStatus;
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/admin/blog/${id}`, {
        method: "DELETE"
      });
      return response;
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

  // Toggle publish status mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: number; published: boolean }) => {
      const updateData: any = { published };
      if (published && !allPosts.find(p => p.id === id)?.publishedAt) {
        updateData.publishedAt = new Date().toISOString();
      }
      
      const response = await apiRequest(`/api/admin/blog/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData)
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: `Post ${variables.published ? 'published' : 'unpublished'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post status",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setSelectedPost(null);
    setIsCreating(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedPost(null);
    queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedPost(null);
  };

  if (isEditing || isCreating) {
    return (
      <BlogEditor
        post={selectedPost || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-muted-foreground">Create and manage blog posts</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary text-black hover:bg-primary/80">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts by title, content, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All ({allPosts.length})
              </Button>
              <Button
                variant={filterStatus === "published" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("published")}
              >
                Published ({allPosts.filter(p => p.published).length})
              </Button>
              <Button
                variant={filterStatus === "draft" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("draft")}
              >
                Draft ({allPosts.filter(p => !p.published).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Blog Posts ({filteredPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== "all" 
                  ? "No posts match your filters" 
                  : "No blog posts created yet"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button onClick={handleCreate} className="mt-4">
                  Create Your First Post
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Read Time</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {post.excerpt}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={post.published ? "default" : "secondary"}
                          className={post.published ? "bg-green-500 text-white" : ""}
                        >
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags && post.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.readTime || 5} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {post.createdAt ? format(new Date(post.createdAt), "MMM dd, yyyy") : "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.publishedAt ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(post.publishedAt), "MMM dd, yyyy")}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(post)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePublishMutation.mutate({
                              id: post.id,
                              published: !post.published
                            })}
                            className="h-8 w-8 p-0"
                            disabled={togglePublishMutation.isPending}
                          >
                            {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{post.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(post.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}