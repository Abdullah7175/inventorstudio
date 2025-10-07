import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  BookOpen,
  Eye,
  FileText,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author_id: string;
  published: boolean;
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  read_time?: number;
  status: string;
  created_at: string;
}

interface BlogModalProps {
  mode: 'create' | 'edit';
  existingPost?: BlogPost;
  onPostUpdate: () => void;
  children: React.ReactNode;
}

// Blog Modal Component
function BlogModal({ mode, existingPost, onPostUpdate, children }: BlogModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    published: false,
    meta_title: '',
    meta_description: '',
    tags: [] as string[],
    read_time: 5
  });
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open && mode === 'edit' && existingPost) {
      setFormData({
        title: existingPost.title,
        slug: existingPost.slug,
        excerpt: existingPost.excerpt,
        content: existingPost.content,
        featured_image: existingPost.featured_image || '',
        published: existingPost.published,
        meta_title: existingPost.meta_title || '',
        meta_description: existingPost.meta_description || '',
        tags: existingPost.tags || [],
        read_time: existingPost.read_time || 5
      });
    } else if (open && mode === 'create') {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        published: false,
        meta_title: '',
        meta_description: '',
        tags: [],
        read_time: 5
      });
    }
  }, [open, mode, existingPost]);

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === 'create' ? '/api/seo/blog' : `/api/seo/blog/${existingPost?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          status: formData.published ? 'published' : 'draft'
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Blog post ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        setOpen(false);
        onPostUpdate();
      } else {
        throw new Error('Failed to save blog post');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      
      {open && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <Card 
            className="w-full max-w-6xl max-h-[90vh] overflow-y-auto mx-4 my-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>{mode === 'create' ? 'Add New Blog Post' : 'Edit Blog Post'}</CardTitle>
              <CardDescription>
                {mode === 'create' ? 'Create a new blog post' : 'Update blog post information'}
              </CardDescription>
            </CardHeader>
            <CardContent onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Blog post title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="blog-post-slug"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of the blog post"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[80px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Full blog post content"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[200px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Featured Image URL</label>
                  <Input
                    value={formData.featured_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meta Title</label>
                    <Input
                      value={formData.meta_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      placeholder="SEO meta title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Read Time (minutes)</label>
                    <Input
                      type="number"
                      value={formData.read_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, read_time: parseInt(e.target.value) || 5 }))}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta Description</label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO meta description"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[60px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="published" className="text-sm font-medium">
                    Published
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {mode === 'create' ? 'Create Blog Post' : 'Update Blog Post'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>,
        document.body
      )}
    </>
  );
}

export default function BlogManagement() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlogPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/seo/blog', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data);
      } else {
        console.error('Failed to fetch blog posts:', response.status, response.statusText);
        setBlogPosts([]);
        toast({
          title: "Error",
          description: "Failed to fetch blog posts. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Blog Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Manage your blog posts and content</p>
        </div>
        <BlogModal mode="create" onPostUpdate={fetchBlogPosts}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </BlogModal>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts ({filteredPosts.length})</CardTitle>
          <CardDescription>Manage your blog content</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No blog posts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search criteria' : 'Get started by creating your first blog post'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {post.featured_image ? (
                            <img 
                              src={post.featured_image} 
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {post.excerpt}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {post.read_time} min read
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={post.status === 'published' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.published_at ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">
                            {new Date(post.published_at).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not published</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <BlogModal mode="edit" existingPost={post} onPostUpdate={fetchBlogPosts}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Post
                            </DropdownMenuItem>
                          </BlogModal>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
