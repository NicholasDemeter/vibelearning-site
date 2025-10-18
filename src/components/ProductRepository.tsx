import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileCode } from "lucide-react";
import { useCopy } from "@/hooks/useCopy";
import { toolRegistryManager } from "@/lib/toolRegistry";
import { useEffect, useState } from "react";
import type { Tool } from "@/lib/toolRegistry";

const ProductRepository = () => {
  const { getString } = useCopy();
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    const loadTools = async () => {
      const activeTools = await toolRegistryManager.getActiveTools();
      console.log('Loaded active tools:', activeTools);
      setTools(activeTools);
    };
    loadTools();

    // Listen for storage changes to reload tools when they're updated
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tool_registry') {
        console.log('Tool registry updated, reloading...');
        loadTools();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-window updates
    const handleRegistryUpdate = () => {
      console.log('Tool registry updated (custom event), reloading...');
      loadTools();
    };
    window.addEventListener('toolRegistryUpdated', handleRegistryUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('toolRegistryUpdated', handleRegistryUpdate);
    };
  }, []);

  const handleOpenTool = async (tool: Tool) => {
    if (tool.type === 'single') {
      const content = await toolRegistryManager.getToolContent(tool.id);
      if (content) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } else if (tool.type === 'multi-file') {
      // For multi-file projects, we'll need a different approach
      // For now, just show a message
      alert('Multi-file tools coming soon!');
    } else if (tool.type === 'source-stack') {
      // For source-stack, provide download
      const sourceFiles = await toolRegistryManager.getToolSourceFiles(tool.id);
      if (sourceFiles) {
        // Create a ZIP file with all source files
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        
        Object.entries(sourceFiles).forEach(([path, content]) => {
          zip.file(path, content as string);
        });
        
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tool.name.replace(/\s+/g, '-').toLowerCase()}-source.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
            {getString("products.header", "Product Repository")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {getString("products.subcopy", "Tools and frameworks built on Vibe Learning principles. Each product embodies transparency, simplicity, and human-centric design.")}
          </p>
        </div>

        {tools.length === 0 ? (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-gradient-warm flex items-center justify-center mx-auto mb-6">
              <FileCode className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-light mb-4">No Tools Available Yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first HTML tool through the Admin Dashboard to see it here.
            </p>
            <Button variant="vibe" onClick={() => window.location.href = '/admin'}>
              Go to Admin Dashboard
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {tools.map((tool) => (
              <Card key={tool.id} className="group hover:shadow-warm transition-all duration-300 bg-card/80 backdrop-blur-sm">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center">
                        <FileCode className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tool.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">{tool.category}</p>
                          {tool.type === 'source-stack' && (
                            <Badge variant="outline" className="text-xs">
                              Source Stack
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="default">
                      Active
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Version {tool.version} • Uploaded {new Date(tool.uploaded_date).toLocaleDateString()}
                    </p>
                  </div>

                   <div className="flex gap-3 pt-2">
                    <Button 
                      variant="vibe" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleOpenTool(tool)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {tool.type === 'source-stack' ? 'Download Source' : getString("products.explore", "Open Tool")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductRepository;