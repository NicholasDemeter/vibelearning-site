import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import chalkboardBg from "@/assets/chalkboard-bg.jpg";

interface PhilosophyVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'youtube' | 'vimeo' | 'direct';
  active: boolean;
}

const Philosophy = () => {
  const [activeVideo, setActiveVideo] = useState<PhilosophyVideo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadActiveVideo();
  }, []);

  const loadActiveVideo = () => {
    try {
      const savedVideos = localStorage.getItem('philosophy-videos');
      if (savedVideos) {
        const videos = JSON.parse(savedVideos);
        const active = videos.find((v: PhilosophyVideo) => v.active);
        setActiveVideo(active || null);
      }
    } catch (error) {
      console.error('Failed to load video:', error);
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

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${chalkboardBg})` }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
              Our Design Philosophy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch our philosophy in action through this curated video experience
            </p>
          </div>

          {/* Video Content */}
          {activeVideo ? (
            <Card className="bg-gradient-glass border-border/50">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Video Player */}
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
                  
                  {/* Video Info */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">{activeVideo.title}</h2>
                    {activeVideo.description && (
                      <p className="text-muted-foreground leading-relaxed">
                        {activeVideo.description}
                      </p>
                    )}
                    
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => window.open(activeVideo.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Original
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* No Video Available */
            <Card className="bg-gradient-glass border-border/50">
              <CardContent className="p-12 text-center">
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Philosophy Video Coming Soon</h2>
                    <p className="text-muted-foreground">
                      Our design philosophy video is currently being prepared. 
                      Please check back soon or contact the administrator to add content.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Philosophy;