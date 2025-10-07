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
  Award,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Certification {
  id: number;
  title: string;
  issuer: string;
  description?: string;
  certificate_image?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  verification_url?: string;
  category: string;
  order: number;
  created_at: string;
}

interface CertificationModalProps {
  mode: 'create' | 'edit';
  existingCertification?: Certification;
  onCertificationUpdate: () => void;
  children: React.ReactNode;
}

// Certification Modal Component
function CertificationModal({ mode, existingCertification, onCertificationUpdate, children }: CertificationModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    description: '',
    certificate_image: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    verification_url: '',
    category: 'web',
    order: 0
  });
  const { toast } = useToast();

  const categories = [
    { value: 'web', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'cloud', label: 'Cloud' },
    { value: 'security', label: 'Security' }
  ];

  useEffect(() => {
    if (open && mode === 'edit' && existingCertification) {
      setFormData({
        title: existingCertification.title,
        issuer: existingCertification.issuer,
        description: existingCertification.description || '',
        certificate_image: existingCertification.certificate_image || '',
        issue_date: existingCertification.issue_date ? existingCertification.issue_date.split('T')[0] : '',
        expiry_date: existingCertification.expiry_date ? existingCertification.expiry_date.split('T')[0] : '',
        credential_id: existingCertification.credential_id || '',
        verification_url: existingCertification.verification_url || '',
        category: existingCertification.category,
        order: existingCertification.order
      });
    } else if (open && mode === 'create') {
      setFormData({
        title: '',
        issuer: '',
        description: '',
        certificate_image: '',
        issue_date: '',
        expiry_date: '',
        credential_id: '',
        verification_url: '',
        category: 'web',
        order: 0
      });
    }
  }, [open, mode, existingCertification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === 'create' ? '/api/seo/certifications' : `/api/seo/certifications/${existingCertification?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          issue_date: formData.issue_date ? new Date(formData.issue_date).toISOString() : null,
          expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Certification ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        setOpen(false);
        onCertificationUpdate();
      } else {
        throw new Error('Failed to save certification');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save certification",
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
              <CardTitle>{mode === 'create' ? 'Add New Certification' : 'Edit Certification'}</CardTitle>
              <CardDescription>
                {mode === 'create' ? 'Add a new certification to showcase your expertise' : 'Update certification information'}
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
                      placeholder="Certification title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Issuer</label>
                    <Input
                      value={formData.issuer}
                      onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                      placeholder="Certification issuer"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the certification"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Certificate Image URL</label>
                  <Input
                    value={formData.certificate_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, certificate_image: e.target.value }))}
                    placeholder="https://example.com/certificate.jpg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Issue Date</label>
                    <Input
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expiry Date</label>
                    <Input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Credential ID</label>
                    <Input
                      value={formData.credential_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, credential_id: e.target.value }))}
                      placeholder="Credential ID or verification code"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Verification URL</label>
                    <Input
                      value={formData.verification_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, verification_url: e.target.value }))}
                      placeholder="https://example.com/verify"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Order</label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {mode === 'create' ? 'Create Certification' : 'Update Certification'}
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

export default function CertificationsManagement() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCertifications = useCallback(async () => {
    try {
      const response = await fetch('/api/seo/certifications', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCertifications(data);
      } else {
        console.error('Failed to fetch certifications:', response.status, response.statusText);
        setCertifications([]);
        toast({
          title: "Error",
          description: "Failed to fetch certifications. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch certifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'web', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'cloud', label: 'Cloud' },
    { value: 'security', label: 'Security' }
  ];

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || cert.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Certifications Management</h1>
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
          <h1 className="text-3xl font-bold">Certifications Management</h1>
          <p className="text-muted-foreground">Manage your professional certifications and credentials</p>
        </div>
        <CertificationModal mode="create" onCertificationUpdate={fetchCertifications}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>
        </CertificationModal>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search certifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Certifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Certifications ({filteredCertifications.length})</CardTitle>
          <CardDescription>Manage your professional certifications</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCertifications.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No certifications found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your search criteria' : 'Get started by adding your first certification'}
              </p>
              {!searchTerm && categoryFilter === 'all' && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Certification
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certification</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertifications.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{cert.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {cert.credential_id && `ID: ${cert.credential_id}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{cert.issuer}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {cert.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">
                          {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cert.expiry_date ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">
                            {new Date(cert.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {cert.verification_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={cert.verification_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <CertificationModal mode="edit" existingCertification={cert} onCertificationUpdate={fetchCertifications}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Certification
                              </DropdownMenuItem>
                            </CertificationModal>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Certification
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
