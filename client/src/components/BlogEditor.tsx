import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Image, 
  Tag, 
  X, 
  Plus,
  Clock,
  Hash,
  FileText,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type BlogPost, type InsertBlogPost } from "@shared/schema";

interface BlogEditorProps {
  post?: BlogPost;
  onSave?: (post: BlogPost) => void;
  onCancel?: () => void;
}

export default function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const [formData, setFormData] = useState<Partial<InsertBlogPost>>({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    featuredImage: post?.featuredImage || "",
    published: post?.published || false,
    metaTitle: post?.metaTitle || "",
    metaDescription: post?.metaDescription || "",
    tags: post?.tags || [],
    readTime: post?.readTime || 5,
  });

  const [newTag, setNewTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !post) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, post]);

  // Auto-generate meta title from title
  useEffect(() => {
    if (formData.title && !formData.metaTitle) {
      setFormData(prev => ({ 
        ...prev, 
        metaTitle: formData.title?.slice(0, 60) 
      }));
    }
  }, [formData.title, formData.metaTitle]);

  // Save/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<InsertBlogPost>) => {
      const url = post ? `/api/admin/blog/${post.id}` : "/api/admin/blog";
      const method = post ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: post ? "Blog post updated successfully" : "Blog post created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      onSave?.(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save blog post",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in title, slug, excerpt, and content",
        variant: "destructive",
      });
      return;
    }

    const saveData = { ...formData };
    if (saveData.published && !post?.publishedAt) {
      saveData.publishedAt = new Date();
    }

    saveMutation.mutate(saveData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {post ? "Edit Post" : "Create New Post"}
            </h2>
            <p className="text-muted-foreground">
              {post ? `Editing "${post.title}"` : "Write and publish a new blog post"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-primary text-black hover:bg-primary/80"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Post"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isPreview ? (
                <>
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter blog post title"
                      className="text-lg font-medium"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-friendly-slug"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL: /blog/{formData.slug}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief description for the blog post"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.excerpt?.length || 0}/160 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your blog post content in Markdown..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports Markdown formatting
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">{formData.title}</h1>
                    <p className="text-muted-foreground mt-2">{formData.excerpt}</p>
                    {formData.featuredImage && (
                      <img 
                        src={formData.featuredImage} 
                        alt={formData.title}
                        className="w-full h-64 object-cover rounded-lg mt-4"
                      />
                    )}
                  </div>
                  <Separator />
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {formData.content}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Publish Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published">Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Make this post visible to readers
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={formData.published || false}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, published: checked }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.readTime || 5}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    readTime: parseInt(e.target.value) || 5 
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Featured Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="featuredImage">Image URL</Label>
                <Input
                  id="featuredImage"
                  value={formData.featuredImage || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.featuredImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.featuredImage} 
                      alt="Featured"
                      className="w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag"
                  className="flex-1"
                />
                <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="SEO optimized title"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.metaTitle?.length || 0}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Brief description for search engines"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.metaDescription?.length || 0}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}