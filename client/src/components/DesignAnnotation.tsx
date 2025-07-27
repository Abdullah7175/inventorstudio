import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  X, 
  Send, 
  Edit3, 
  Trash2, 
  Pin,
  Eye,
  EyeOff,
  Palette
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Annotation {
  id: string;
  x: number;
  y: number;
  comment: string;
  author: string;
  authorId: string;
  timestamp: Date;
  resolved: boolean;
  color: string;
}

interface DesignAnnotationProps {
  imageUrl: string;
  projectId?: number;
  readOnly?: boolean;
  className?: string;
}

const ANNOTATION_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"
];

export default function DesignAnnotation({ 
  imageUrl, 
  projectId, 
  readOnly = false,
  className = ""
}: DesignAnnotationProps) {
  const { user } = useAuth();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedColor, setSelectedColor] = useState(ANNOTATION_COLORS[0]);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load annotations for the project
  useEffect(() => {
    if (projectId) {
      // Mock data - replace with actual API call
      const mockAnnotations: Annotation[] = [
        {
          id: "1",
          x: 25,
          y: 30,
          comment: "Consider making this button more prominent",
          author: "Sarah Johnson",
          authorId: "user-1",
          timestamp: new Date(Date.now() - 3600000),
          resolved: false,
          color: "#FF6B6B"
        },
        {
          id: "2",
          x: 60,
          y: 45,
          comment: "Typography hierarchy needs improvement here",
          author: "Mike Davis",
          authorId: "user-2",
          timestamp: new Date(Date.now() - 7200000),
          resolved: true,
          color: "#4ECDC4"
        }
      ];
      setAnnotations(mockAnnotations);
    }
  }, [projectId]);

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (readOnly || !isAddingAnnotation || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPendingPosition({ x, y });
  };

  const handleAddAnnotation = () => {
    if (!pendingPosition || !newComment.trim() || !user) return;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      x: pendingPosition.x,
      y: pendingPosition.y,
      comment: newComment.trim(),
      author: (user as any).firstName || "Anonymous",
      authorId: (user as any).id,
      timestamp: new Date(),
      resolved: false,
      color: selectedColor
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setNewComment("");
    setPendingPosition(null);
    setIsAddingAnnotation(false);
    
    // TODO: Send to backend via WebSocket or API
  };

  const handleResolveAnnotation = (id: string) => {
    setAnnotations(prev => 
      prev.map(ann => 
        ann.id === id ? { ...ann, resolved: !ann.resolved } : ann
      )
    );
    // TODO: Update backend
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    setSelectedAnnotation(null);
    // TODO: Update backend
  };

  const cancelAnnotation = () => {
    setPendingPosition(null);
    setNewComment("");
    setIsAddingAnnotation(false);
  };

  const getAnnotationNumber = (id: string) => {
    return annotations.findIndex(ann => ann.id === id) + 1;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnnotations(!showAnnotations)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {showAnnotations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        
        {!readOnly && (
          <>
            <Button
              variant={isAddingAnnotation ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
              className="bg-background/80 backdrop-blur-sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {isAddingAnnotation ? "Cancel" : "Add Note"}
            </Button>
            
            {isAddingAnnotation && (
              <div className="flex items-center gap-2">
                {ANNOTATION_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedColor === color ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Image */}
      <div className="relative">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Design for annotation"
          className={`w-full h-auto ${isAddingAnnotation ? 'cursor-crosshair' : 'cursor-default'}`}
          onClick={handleImageClick}
          draggable={false}
        />

        {/* Annotations */}
        <AnimatePresence>
          {showAnnotations && annotations.map((annotation) => (
            <motion.div
              key={annotation.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${annotation.x}%`,
                top: `${annotation.y}%`,
              }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-8 h-8 rounded-full text-white font-bold text-sm shadow-lg ${
                  annotation.resolved ? 'opacity-50' : 'opacity-100'
                } ${selectedAnnotation === annotation.id ? 'ring-2 ring-white' : ''}`}
                style={{ backgroundColor: annotation.color }}
                onClick={() => setSelectedAnnotation(
                  selectedAnnotation === annotation.id ? null : annotation.id
                )}
              >
                {getAnnotationNumber(annotation.id)}
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pending Annotation */}
        {pendingPosition && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${pendingPosition.x}%`,
              top: `${pendingPosition.y}%`,
            }}
          >
            <div
              className="w-8 h-8 rounded-full text-white font-bold text-sm shadow-lg flex items-center justify-center animate-pulse"
              style={{ backgroundColor: selectedColor }}
            >
              ?
            </div>
          </div>
        )}
      </div>

      {/* Annotation Details Panel */}
      <AnimatePresence>
        {selectedAnnotation && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 w-80 h-full bg-background border-l shadow-xl z-20"
          >
            <Card className="h-full rounded-none border-0">
              <CardContent className="p-4 h-full flex flex-col">
                {(() => {
                  const annotation = annotations.find(ann => ann.id === selectedAnnotation);
                  if (!annotation) return null;

                  return (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: annotation.color }}
                          />
                          <span className="font-medium">
                            Note #{getAnnotationNumber(annotation.id)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAnnotation(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Comment</p>
                          <p className="text-sm">{annotation.comment}</p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Author</p>
                          <p className="text-sm font-medium">{annotation.author}</p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Created</p>
                          <p className="text-sm">
                            {annotation.timestamp.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={annotation.resolved ? "default" : "secondary"}
                            className={annotation.resolved ? "bg-green-500" : ""}
                          >
                            {annotation.resolved ? "Resolved" : "Open"}
                          </Badge>
                        </div>
                      </div>

                      {!readOnly && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveAnnotation(annotation.id)}
                            className="flex-1"
                          >
                            <Pin className="h-4 w-4 mr-2" />
                            {annotation.resolved ? "Reopen" : "Resolve"}
                          </Button>
                          
                          {(user as any)?.id === annotation.authorId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAnnotation(annotation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Annotation Dialog */}
      <AnimatePresence>
        {pendingPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-4 left-4 right-4 z-20"
          >
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className="font-medium">Add Annotation</span>
                  </div>
                  
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter your comment..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && newComment.trim()) {
                        handleAddAnnotation();
                      }
                    }}
                    autoFocus
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddAnnotation}
                      disabled={!newComment.trim()}
                      size="sm"
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelAnnotation}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}