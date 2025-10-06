import React, { useState, useEffect, useCallback } from 'react';
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
        // Mock data for demonstration
        const mockSEOContent: SEOContent[] = [
          {
            id: 1,
            title: 'About Us - Inventor Design Studio',
            slug: 'about',
            content: 'Full about page content...',
            meta_description: 'Learn about Inventor Design Studio, a leading web development company specializing in modern solutions.',
            meta_keywords: ['about', 'company', 'web development', 'design studio'],
            status: 'published',
            author_id: 'author-1',
            published_at: '2024-12-01T10:00:00Z',
            created_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 2,
            title: 'Services - Web Development Solutions',
            slug: 'services',
            content: 'Full services page content...',
            meta_description: 'Comprehensive web development services including React, Node.js, and modern technologies.',
            meta_keywords: ['services', 'web development', 'React', 'Node.js'],
            status: 'published',
            author_id: 'author-1',
            published_at: '2024-12-01T10:00:00Z',
            created_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 3,
            title: 'Portfolio - Our Work',
            slug: 'portfolio',
            content: 'Full portfolio page content...',
            meta_description: 'View our portfolio of successful web development projects and client work.',
            meta_keywords: ['portfolio', 'projects', 'work', 'examples'],
            status: 'published',
            author_id: 'author-1',
            published_at: '2024-12-01T10:00:00Z',
            created_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 4,
            title: 'Contact Us - Get In Touch',
            slug: 'contact',
            content: 'Full contact page content...',
            meta_description: 'Contact Inventor Design Studio for your web development needs. Get a free quote today.',
            meta_keywords: ['contact', 'get in touch', 'quote', 'web development'],
            status: 'draft',
            author_id: 'author-1',
            created_at: '2024-12-02T10:00:00Z'
          }
        ];
        setSeoContent(mockSEOContent);
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New SEO Content
        </Button>
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
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Content
                            </DropdownMenuItem>
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
