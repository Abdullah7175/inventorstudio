import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GitBranch, 
  Eye, 
  Download, 
  Share2, 
  Clock, 
  User,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Check,
  X,
  Star
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface DesignVersion {
  id: string;
  projectId: number;
  version: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  isActive: boolean;
  changes: string[];
  comments: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: string;
    type: 'feedback' | 'approval' | 'change-request';
  }>;
  metrics: {
    views: number;
    downloads: number;
    likes: number;
    rating: number;
  };
}

interface DesignVersionComparisonProps {
  projectId: number;
  onVersionSelect?: (version: DesignVersion) => void;
}

export default function DesignVersionComparison({ 
  projectId, 
  onVersionSelect 
}: DesignVersionComparisonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'compare' | 'slider'>('grid');
  const [fullscreen, setFullscreen] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  const { data: versions, isLoading } = useQuery({
    queryKey: ['/api/projects/design-versions', projectId],
    enabled: !!projectId
  });

  const updateVersionStatus = useMutation({
    mutationFn: async ({ versionId, status }: { versionId: string; status: string }) => {
      return await apiRequest(`/api/projects/design-versions/${versionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects/design-versions', projectId] });
    }
  });

  const likeVersion = useMutation({
    mutationFn: async (versionId: string) => {
      return await apiRequest(`/api/projects/design-versions/${versionId}/like`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects/design-versions', projectId] });
    }
  });

  const downloadVersion = useMutation({
    mutationFn: async (versionId: string) => {
      const response = await apiRequest(`/api/projects/design-versions/${versionId}/download`, {
        method: 'GET'
      });
      return response;
    },
    onSuccess: (data, versionId) => {
      // Create download link
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      queryClient.invalidateQueries({ queryKey: ['/api/projects/design-versions', projectId] });
    }
  });

  const handleVersionSelect = (versionId: string) => {
    if (viewMode === 'compare') {
      if (selectedVersions.includes(versionId)) {
        setSelectedVersions(selectedVersions.filter(id => id !== versionId));
      } else if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, versionId]);
      } else {
        setSelectedVersions([selectedVersions[1], versionId]);
      }
    } else {
      setSelectedVersions([versionId]);
      if (onVersionSelect) {
        const version = versions?.find((v: DesignVersion) => v.id === versionId);
        if (version) onVersionSelect(version);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'review': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSliderMove = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-lime-400" />
            Design Versions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedVersionData = selectedVersions.map(id => 
    versions?.find((v: DesignVersion) => v.id === id)
  ).filter(Boolean);

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4' : ''}`}>
      <Card className="w-full h-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-lime-400" />
              Design Versions
              {versions && (
                <Badge variant="secondary">
                  {versions.length} versions
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <div className="flex border rounded-lg">
                {['grid', 'compare', 'slider'].map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode as any)}
                    className={viewMode === mode ? 'bg-lime-400 text-black' : ''}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
              >
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {viewMode === 'compare' && (
            <div className="text-sm text-gray-500">
              Select up to 2 versions to compare. Currently selected: {selectedVersions.length}/2
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto">
              {versions?.map((version: DesignVersion) => (
                <Card
                  key={version.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedVersions.includes(version.id) ? 'ring-2 ring-lime-400' : ''
                  } ${version.isActive ? 'border-2 border-lime-400' : ''}`}
                  onClick={() => handleVersionSelect(version.id)}
                >
                  <div className="relative">
                    <img
                      src={version.thumbnailUrl}
                      alt={version.title}
                      className="w-full aspect-video object-cover rounded-t-lg"
                    />
                    {version.isActive && (
                      <Badge className="absolute top-2 left-2 bg-lime-400 text-black">
                        Active
                      </Badge>
                    )}
                    <Badge 
                      className={`absolute top-2 right-2 ${getStatusColor(version.status)} text-white`}
                    >
                      {version.status.charAt(0).toUpperCase() + version.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{version.title}</h3>
                        <p className="text-sm text-gray-500">v{version.version}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm">{version.metrics.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {version.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {version.createdBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(version.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>{version.metrics.views} views</span>
                        <span>{version.metrics.downloads} downloads</span>
                        <span>{version.metrics.likes} likes</span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            likeVersion.mutate(version.id);
                          }}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadVersion.mutate(version.id);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'compare' && selectedVersionData.length === 2 && (
            <div className="grid grid-cols-2 gap-6 h-full">
              {selectedVersionData.map((version, index) => (
                <div key={version.id} className="flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{version.title}</h3>
                      <p className="text-sm text-gray-500">v{version.version}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVersionStatus.mutate({ 
                          versionId: version.id, 
                          status: 'approved' 
                        })}
                        className="text-green-600 border-green-600"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVersionStatus.mutate({ 
                          versionId: version.id, 
                          status: 'rejected' 
                        })}
                        className="text-red-600 border-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <img
                    src={version.imageUrl}
                    alt={version.title}
                    className="w-full flex-1 object-contain rounded-lg border"
                  />
                  
                  <div className="mt-4 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Changes:</span>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {version.changes.map((change, i) => (
                          <li key={i} className="text-gray-600 dark:text-gray-300">
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formatDate(version.createdAt)}</span>
                      <span>by {version.createdBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'slider' && selectedVersionData.length === 2 && (
            <div className="relative h-[500px]">
              <div
                ref={sliderRef}
                className="relative w-full h-full overflow-hidden rounded-lg cursor-col-resize"
                onClick={handleSliderMove}
              >
                <img
                  src={selectedVersionData[0].imageUrl}
                  alt={selectedVersionData[0].title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={selectedVersionData[1].imageUrl}
                    alt={selectedVersionData[1].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div
                  className="absolute top-0 bottom-0 w-1 bg-lime-400 cursor-col-resize z-10"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center">
                    <ChevronLeft className="w-3 h-3 text-black" />
                    <ChevronRight className="w-3 h-3 text-black" />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <Badge className="bg-black/50 text-white">
                  {selectedVersionData[0].title} (v{selectedVersionData[0].version})
                </Badge>
                <Badge className="bg-black/50 text-white">
                  {selectedVersionData[1].title} (v{selectedVersionData[1].version})
                </Badge>
              </div>
            </div>
          )}

          {(viewMode === 'compare' || viewMode === 'slider') && selectedVersionData.length < 2 && (
            <div className="text-center py-12">
              <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Select 2 versions to compare
              </p>
              <p className="text-sm text-gray-400">
                Click on design versions from the grid view to select them for comparison
              </p>
            </div>
          )}

          {(!versions || versions.length === 0) && (
            <div className="text-center py-12">
              <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No design versions available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}