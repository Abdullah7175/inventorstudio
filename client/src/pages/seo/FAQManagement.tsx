import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  HelpCircle,
  ArrowUp,
  ArrowDown,
  GripVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface FAQModalProps {
  mode: 'create' | 'edit';
  existingFAQ?: FAQItem;
  onFAQUpdate: () => void;
  children: React.ReactNode;
}

// FAQ Modal Component
function FAQModal({ mode, existingFAQ, onFAQUpdate, children }: FAQModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open && mode === 'edit' && existingFAQ) {
      setFormData({
        question: existingFAQ.question,
        answer: existingFAQ.answer
      });
    } else if (open && mode === 'create') {
      setFormData({
        question: '',
        answer: ''
      });
    }
  }, [open, mode, existingFAQ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = mode === 'create' ? '/api/seo/faq' : `/api/seo/faq/${existingFAQ?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `FAQ item ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        setOpen(false);
        onFAQUpdate();
      } else {
        throw new Error('Failed to save FAQ item');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save FAQ item",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{mode === 'create' ? 'Add New FAQ' : 'Edit FAQ Item'}</CardTitle>
              <CardDescription>
                {mode === 'create' ? 'Add a new frequently asked question' : 'Update FAQ item information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question</label>
                  <Input
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="What is your question?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Answer</label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Provide a detailed answer..."
                    className="w-full min-h-[150px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {mode === 'create' ? 'Create FAQ' : 'Update FAQ'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default function FAQManagement() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFAQs = useCallback(async () => {
    try {
      const response = await fetch('/api/seo/faq', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setFaqItems(data);
      } else {
        // Mock data for demonstration
        const mockFAQs: FAQItem[] = [
          {
            id: 1,
            question: 'What services do you offer?',
            answer: 'We offer comprehensive web development, mobile app development, UI/UX design, digital marketing, e-commerce solutions, and cloud infrastructure services.',
            order: 1
          },
          {
            id: 2,
            question: 'How long does a typical project take?',
            answer: 'Project timelines vary depending on complexity. A simple website typically takes 2-4 weeks, while complex applications can take 3-6 months. We provide detailed timelines during the consultation phase.',
            order: 2
          },
          {
            id: 3,
            question: 'Do you provide ongoing support after project completion?',
            answer: 'Yes, we offer comprehensive post-launch support including maintenance, updates, bug fixes, and feature enhancements. Support packages are available based on your needs.',
            order: 3
          },
          {
            id: 4,
            question: 'What technologies do you use?',
            answer: 'We use modern technologies including React, Node.js, TypeScript, Python, PostgreSQL, MongoDB, AWS, and more. Our tech stack is chosen based on project requirements and best practices.',
            order: 4
          },
          {
            id: 5,
            question: 'Can you help with SEO optimization?',
            answer: 'Absolutely! We provide comprehensive SEO services including keyword research, on-page optimization, technical SEO, content strategy, and performance monitoring.',
            order: 5
          },
          {
            id: 6,
            question: 'What is Shopify CLI?',
            answer: 'Shopify CLI is a command-line tool that helps developers build, test, and deploy Shopify apps and themes efficiently. We are experts in both direct Shopify development and CLI-based solutions.',
            order: 6
          }
        ];
        setFaqItems(mockFAQs);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch FAQ items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/seo/faq/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "FAQ item deleted successfully",
        });
        fetchFAQs();
      } else {
        throw new Error('Failed to delete FAQ item');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete FAQ item",
        variant: "destructive",
      });
    }
  };

  const moveItem = async (id: number, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/seo/faq/${id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ direction })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "FAQ order updated successfully",
        });
        fetchFAQs();
      } else {
        throw new Error('Failed to move FAQ item');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move FAQ item",
        variant: "destructive",
      });
    }
  };

  const filteredFAQs = faqItems.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by order
  const sortedFAQs = filteredFAQs.sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">FAQ Management</h1>
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
          <h1 className="text-3xl font-bold">FAQ Management</h1>
          <p className="text-muted-foreground">Manage frequently asked questions and help content</p>
        </div>
        <FAQModal mode="create" onFAQUpdate={fetchFAQs}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </FAQModal>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search FAQ items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Items */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ Items ({sortedFAQs.length})</CardTitle>
          <CardDescription>Manage your frequently asked questions</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedFAQs.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No FAQ items found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first FAQ item'}
              </p>
              {!searchTerm && (
                <FAQModal mode="create" onFAQUpdate={fetchFAQs}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First FAQ
                  </Button>
                </FAQModal>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedFAQs.map((faq, index) => (
                <Card key={faq.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                            {faq.order}
                          </div>
                          <h3 className="text-lg font-semibold">{faq.question}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Move buttons */}
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(faq.id, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(faq.id, 'down')}
                            disabled={index === sortedFAQs.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Actions menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <FAQModal mode="edit" existingFAQ={faq} onFAQUpdate={fetchFAQs}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit FAQ
                              </DropdownMenuItem>
                            </FAQModal>
                            <DropdownMenuItem
                              onClick={() => handleDelete(faq.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete FAQ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
