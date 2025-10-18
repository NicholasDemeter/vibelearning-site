import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Video, Upload, Play, Trash2, Edit2, Save, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhilosophyVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'youtube' | 'vimeo' | 'direct';
  thumbnail?: string;
  duration?: string;
  uploaded_date: string;
  active: boolean;
}

export const VideoManagement = () => {
  const [videos, setVideos] = useState<PhilosophyVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<PhilosophyVideo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    url: '',
    type: 'youtube' as 'youtube' | 'vimeo' | 'direct'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    try {
      const savedVideos = localStorage.getItem('philosophy-videos');
      if (savedVideos) {
        const parsed = JSON.parse(savedVideos);
        setVideos(parsed);
        const active = parsed.find((v: PhilosophyVideo) => v.active);
        setActiveVideo(active || null);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    }
  };

  const saveVideos = (videoList: PhilosophyVideo[]) => {
    try {
      localStorage.setItem('philosophy-videos', JSON.stringify(videoList));
      setVideos(videoList);
    } catch (error) {
      toast({
        title: "Error saving videos",
        description: "Failed to save video data",
        variant: "destructive"
      });
    }
  };

  const detectVideoType = (url: string): 'youtube' | 'vimeo' | 'direct' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    } else {
      return 'direct';
    }
  };

  const getEmbedUrl = (url: string, type: string): string => {
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } else if (type === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  };

  const handleAddVideo = () => {
    if (!editForm.title.trim() || !editForm.url.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both title and URL",
        variant: "destructive"
      });
      return;
    }

    const detectedType = detectVideoType(editForm.url);
    const newVideo: PhilosophyVideo = {
      id: Date.now().toString(),
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      url: editForm.url.trim(),
      type: detectedType,
      uploaded_date: new Date().toISOString(),
      active: videos.length === 0 // First video is automatically active
    };

    const updatedVideos = [...videos, newVideo];
    
    // If this is the first video, make it active
    if (videos.length === 0) {
      setActiveVideo(newVideo);
    }
    
    saveVideos(updatedVideos);
    setEditForm({ title: '', description: '', url: '', type: 'youtube' });
    setIsEditing(false);
    
    toast({
      title: "Video added",
      description: "Philosophy video has been added successfully"
    });
  };

  const handleSetActive = (video: PhilosophyVideo) => {
    const updatedVideos = videos.map(v => ({
      ...v,
      active: v.id === video.id
    }));
    
    saveVideos(updatedVideos);
    setActiveVideo(video);
    
    toast({
      title: "Active video updated",
      description: `"${video.title}" is now the active philosophy video`
    });
  };

  const handleDeleteVideo = (videoId: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      const updatedVideos = videos.filter(v => v.id !== videoId);
      
      // If we deleted the active video, set the first remaining video as active
      const deletedVideo = videos.find(v => v.id === videoId);
      if (deletedVideo?.active && updatedVideos.length > 0) {
        updatedVideos[0].active = true;
        setActiveVideo(updatedVideos[0]);
      } else if (deletedVideo?.active) {
        setActiveVideo(null);
      }
      
      saveVideos(updatedVideos);
      
      toast({
        title: "Video deleted",
        description: "Video has been removed successfully"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Active Video */}
      {activeVideo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              Currently Active Philosophy Video
            </CardTitle>
            <CardDescription>
              This video will be shown when users click "Watch Philosophy"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={getEmbedUrl(activeVideo.url, activeVideo.type)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={activeVideo.title}
                  />
                </div>
              </div>
              <div className="lg:w-1/2 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{activeVideo.title}</h3>
                  <p className="text-muted-foreground">{activeVideo.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{activeVideo.type.toUpperCase()}</Badge>
                  <Badge variant="outline">
                    Added {new Date(activeVideo.uploaded_date).toLocaleDateString()}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(activeVideo.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Original
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Add Philosophy Video
          </CardTitle>
          <CardDescription>
            Add a new video for the "Watch Philosophy" section. Supports YouTube, Vimeo, and direct video URLs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="w-full">
              <Video className="w-4 h-4 mr-2" />
              Add New Video
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="video-title">Video Title</Label>
                  <Input
                    id="video-title"
                    placeholder="e.g., Design Philosophy Overview"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    value={editForm.url}
                    onChange={(e) => {
                      const url = e.target.value;
                      setEditForm(prev => ({ 
                        ...prev, 
                        url,
                        type: detectVideoType(url)
                      }));
                    }}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="video-description">Description (Optional)</Label>
                <Textarea
                  id="video-description"
                  placeholder="Brief description of the video content..."
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              {editForm.url && (
                <Alert>
                  <Video className="w-4 h-4" />
                  <AlertDescription>
                    Detected video type: <strong>{editForm.type.toUpperCase()}</strong>
                    {editForm.type !== 'direct' && (
                      <span className="block mt-1 text-sm">
                        Video will be embedded using the platform's player
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleAddVideo}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Video
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({ title: '', description: '', url: '', type: 'youtube' });
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video List */}
      {videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Videos</CardTitle>
            <CardDescription>
              All uploaded philosophy videos. Click to set as active.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {videos.map((video) => (
                <div 
                  key={video.id}
                  className={`p-4 border rounded-lg ${video.active ? 'bg-green-50 border-green-200' : 'bg-background'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{video.title}</h4>
                        {video.active && (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        )}
                        <Badge variant="outline">{video.type.toUpperCase()}</Badge>
                      </div>
                      {video.description && (
                        <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(video.uploaded_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!video.active && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetActive(video)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Set Active
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(video.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteVideo(video.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {videos.length === 0 && (
        <Alert>
          <Video className="w-4 h-4" />
          <AlertDescription>
            No philosophy videos have been added yet. Add your first video to enable the "Watch Philosophy" functionality.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};