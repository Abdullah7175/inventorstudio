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
  FileText,
  Eye,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SEOContent {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description?: string;
  meta_keywords?: string[];
  status: string;
  author_id: string;
  published_at?: string;
  created_at: string;
}

interface SEOContentModalProps {
  mode: 'create' | 'edit';
  existingContent?: SEOContent;
  onContentUpdate: () => void;
  children: React.ReactNode;
}

// SEO Content Modal Component
function SEOContentModal({ mode, existingContent, onContentUpdate, children }: SEOContentModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    meta_description: '',
    meta_keywords: [] as string[],
    status: 'draft'
  });
  const [newKeyword, setNewKeyword] = useState('');
  const { toast } = useToast();

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  useEffect(() => {
    if (open && mode === 'edit' && existingContent) {
      setFormData({
        title: existingContent.title,
        slug: existingContent.slug,
        content: existingContent.content,
        meta_description: existingContent.meta_description || '',
        meta_keywords: existingContent.meta_keywords || [],
        status: existingContent.status
      });
    } else if (open && mode === 'create') {
      setFormData({
        title: '',
        slug: '',
        content: '',
        meta_description: '',
        meta_keywords: [],
        status: 'draft'
      });
    }
  }, [open, mode, existingContent]);

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.meta_keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        meta_keywords: [...prev.meta_keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      meta_keywords: prev.meta_keywords.filter(k => k !== keyword)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === 'create' ? '/api/seo/content' : `/api/seo/content/${existingContent?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          published_at: formData.status === 'published' ? new Date().toISOString() : null
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `SEO Content ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        setOpen(false);
        onContentUpdate();
      } else {
        throw new Error('Failed to save SEO content');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SEO content",
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
              <CardTitle>{mode === 'create' ? 'Add New SEO Content' : 'Edit SEO Content'}</CardTitle>
              <CardDescription>
                {mode === 'create' ? 'Create new SEO-optimized content' : 'Update SEO content information'}
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
                      placeholder="Content title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="content-slug"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Full content text"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[200px]"
                    required
                  />
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
                  <label className="text-sm font-medium">Meta Keywords</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.meta_keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add keyword..."
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" onClick={addKeyword} variant="outline">
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {mode === 'create' ? 'Create SEO Content' : 'Update SEO Content'}
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

export default function SEOContentManagement() {
  const [seoContent, setSeoContent] = useState<SEOContent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSEOContent = useCallback(async () => {
    try {
      const response = await fetch('/api/seo/content', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSeoContent(data);
      } else {
        console.error('Failed to fetch SEO content:', response.status, response.statusText);
        setSeoContent([]);
        toast({
          title: "Error",
          description: "Failed to fetch SEO content. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching SEO content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch SEO content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSEOContent();
  }, [fetchSEOContent]);

  const filteredContent = seoContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || content.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">SEO Content Management</h1>
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
          <h1 className="text-3xl font-bold">SEO Content Management</h1>
          <p className="text-muted-foreground">Manage SEO-optimized content for your website pages</p>
        </div>
        <SEOContentModal mode="create" onContentUpdate={fetchSEOContent}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New SEO Content
          </Button>
        </SEOContentModal>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search SEO content..."
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

      {/* SEO Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Content ({filteredContent.length})</CardTitle>
          <CardDescription>Manage your website's SEO-optimized content</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContent.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No SEO content found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search criteria' : 'Get started by creating your first SEO content'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First SEO Content
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{content.title}</div>
                          {content.meta_description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {content.meta_description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        /{content.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={content.status === 'published' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {content.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {content.meta_keywords?.slice(0, 2).map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {content.meta_keywords && content.meta_keywords.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{content.meta_keywords.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {content.published_at ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">
                            {new Date(content.published_at).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not published</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/${content.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <SEOContentModal mode="edit" existingContent={content} onContentUpdate={fetchSEOContent}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Content
                              </DropdownMenuItem>
                            </SEOContentModal>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Content
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
