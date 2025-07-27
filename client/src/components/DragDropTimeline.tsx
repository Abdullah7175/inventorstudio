import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Plus, 
  GripVertical, 
  Edit3, 
  Trash2, 
  Save,
  X,
  CheckCircle
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignee?: string;
  color: string;
  order: number;
}

interface DragDropTimelineProps {
  projectId: number;
  isEditable?: boolean;
}

export default function DragDropTimeline({ projectId, isEditable = true }: DragDropTimelineProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    assignee: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const { data: timeline, isLoading } = useQuery({
    queryKey: ['/api/projects/timeline', projectId],
    enabled: !!projectId
  });

  const updateTimeline = useMutation({
    mutationFn: async (updatedTimeline: TimelineItem[]) => {
      return await apiRequest(`/api/projects/${projectId}/timeline`, {
        method: 'PUT',
        body: JSON.stringify({ timeline: updatedTimeline })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects/timeline', projectId] });
    }
  });

  const addTimelineItem = useMutation({
    mutationFn: async (item: Omit<TimelineItem, 'id' | 'order'>) => {
      return await apiRequest(`/api/projects/${projectId}/timeline`, {
        method: 'POST',
        body: JSON.stringify(item)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects/timeline', projectId] });
      setShowAddForm(false);
      setNewItem({ title: '', description: '', startDate: '', endDate: '', assignee: '' });
    }
  });

  const deleteTimelineItem = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiRequest(`/api/projects/${projectId}/timeline/${itemId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects/timeline', projectId] });
    }
  });

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId || !timeline) return;

    const items = [...timeline];
    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged item and insert at target position
    const [removed] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, removed);

    // Update order numbers
    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    updateTimeline.mutate(reorderedItems);
    setDraggedItem(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <Calendar className="w-4 h-4" />;
      case 'overdue': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleAddItem = () => {
    if (!newItem.title || !newItem.startDate || !newItem.endDate) return;

    addTimelineItem.mutate({
      ...newItem,
      status: 'pending',
      color: '#22c55e' // Default green color
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-lime-400" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-lime-400" />
            Project Timeline
          </CardTitle>
          {isEditable && (
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="bg-lime-400 text-black hover:bg-lime-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <Card className="border-2 border-lime-400">
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Milestone title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  />
                  <Input
                    placeholder="Assignee"
                    value={newItem.assignee}
                    onChange={(e) => setNewItem({ ...newItem, assignee: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Start Date</label>
                    <Input
                      type="date"
                      value={newItem.startDate}
                      onChange={(e) => setNewItem({ ...newItem, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">End Date</label>
                    <Input
                      type="date"
                      value={newItem.endDate}
                      onChange={(e) => setNewItem({ ...newItem, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddItem}
                    disabled={!newItem.title || !newItem.startDate || !newItem.endDate}
                    className="bg-lime-400 text-black hover:bg-lime-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Add Milestone
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3" ref={dragRef}>
          {timeline && timeline.length > 0 ? (
            timeline
              .sort((a: TimelineItem, b: TimelineItem) => a.order - b.order)
              .map((item: TimelineItem) => (
                <div
                  key={item.id}
                  draggable={isEditable}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.id)}
                  className={`
                    flex items-center gap-4 p-4 border rounded-lg transition-all
                    ${draggedItem === item.id ? 'opacity-50 scale-95' : 'hover:shadow-md'}
                    ${isEditable ? 'cursor-move' : ''}
                    bg-white dark:bg-gray-800
                  `}
                >
                  {isEditable && (
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  )}
                  
                  <div 
                    className={`w-4 h-4 rounded-full ${getStatusColor(item.status)}`}
                    style={{ backgroundColor: item.color }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary"
                          className={`${getStatusColor(item.status)} text-white`}
                        >
                          {getStatusIcon(item.status)}
                          {item.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        {isEditable && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingItem(item.id)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTimelineItem.mutate(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </span>
                      <span>
                        Duration: {calculateDuration(item.startDate, item.endDate)}
                      </span>
                      {item.assignee && (
                        <span>
                          Assigned to: {item.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No timeline items yet</p>
              {isEditable && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-lime-400 text-black hover:bg-lime-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Milestone
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}