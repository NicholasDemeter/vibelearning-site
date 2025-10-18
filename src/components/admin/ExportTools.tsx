import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Package, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

export const ExportTools = () => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchFileAsBlob = async (path: string): Promise<{ blob: Blob; exists: boolean }> => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        return { blob: new Blob(), exists: false };
      }
      const blob = await response.blob();
      return { blob, exists: true };
    } catch {
      return { blob: new Blob(), exists: false };
    }
  };

  const handleDownloadCurrentStack = async () => {
    setIsExporting('stack');
    
    try {
      const zip = new JSZip();
      const skippedFiles: string[] = [];

      // Files to include in the current stack export
      const filesToInclude = [
        // Admin dashboard
        { path: '/export/admin/index.html', zipPath: 'export/admin/index.html' },
        { path: '/export/admin/styles.css', zipPath: 'export/admin/styles.css' },
        { path: '/export/admin/script.js', zipPath: 'export/admin/script.js' },
        
        // Tools and registry
        { path: '/export/tools/tools-registry.json', zipPath: 'export/tools/tools-registry.json' },
        { path: '/export/README.md', zipPath: 'export/README.md' },
        
        // Content
        { path: '/content/strings.json', zipPath: 'content/strings.json' },
        
        // Public assets
        { path: '/assets/vibe-learn-hero.png', zipPath: 'public/assets/vibe-learn-hero.png' },
        { path: '/assets/vibe-learn-logo.png', zipPath: 'public/assets/vibe-learn-logo.png' },
        { path: '/assets/vibe-logo-1.png', zipPath: 'public/assets/vibe-logo-1.png' },
        { path: '/assets/chalkboard-bg.jpg', zipPath: 'public/assets/chalkboard-bg.jpg' },
        { path: '/assets/pattern-bg.jpg', zipPath: 'public/assets/pattern-bg.jpg' },
        { path: '/assets/sustainability.jpg', zipPath: 'public/assets/sustainability.jpg' },
      ];

      // Add main project files (simplified versions for offline use)
      const mainIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VIBE LEARN</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; text-align: center; }
        .hero { padding: 60px 0; }
        .logo { max-width: 300px; margin-bottom: 40px; }
        h1 { font-size: 3rem; font-weight: 300; margin-bottom: 20px; }
        .gradient { background: linear-gradient(135deg, #ff6b6b, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        p { font-size: 1.2rem; color: #666; margin-bottom: 40px; }
        .btn { display: inline-block; padding: 12px 24px; background: #4ecdc4; color: white; text-decoration: none; border-radius: 8px; margin: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <img src="public/assets/vibe-learn-hero.png" alt="VIBE LEARN" class="logo">
            <h1>Learning <span class="gradient">Reimagined</span></h1>
            <p>Where transparency meets curiosity. Beautiful, sustainable technology that makes education empowering and enduring.</p>
            <a href="export/admin/index.html" class="btn">Admin Dashboard</a>
            <a href="#" class="btn">Explore Products</a>
        </div>
    </div>
</body>
</html>`;

      zip.file('index.html', mainIndexHtml);

      // Add README for the complete stack
      const readmeContent = `# VIBE LEARN - Complete Stack Export

This export contains the complete VIBE LEARN project including:

## Structure
- \`index.html\` - Main landing page (simplified offline version)
- \`export/admin/\` - Complete admin dashboard
- \`export/tools/\` - Tools registry and uploaded tools
- \`content/\` - Content management files
- \`public/assets/\` - Images and static assets

## Usage
1. Open \`index.html\` to view the main landing page
2. Navigate to \`export/admin/index.html\` for the admin dashboard
3. The admin dashboard works fully offline with localStorage

## Features
- HTML tool management with ZIP upload support
- Content management system for copy editing
- Export/import functionality
- Fully offline capable

Generated: ${new Date().toISOString()}
`;

      zip.file('README.md', readmeContent);

      // Fetch all files
      for (const file of filesToInclude) {
        const { blob, exists } = await fetchFileAsBlob(file.path);
        if (exists) {
          zip.file(file.zipPath, blob);
        } else {
          skippedFiles.push(file.path);
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, 'vibe-learning-stack.zip');

      if (skippedFiles.length > 0) {
        console.log('Skipped files (not found):', skippedFiles);
      }

      toast({
        title: "Stack exported successfully",
        description: `Downloaded vibe-learning-stack.zip${skippedFiles.length > 0 ? ` (${skippedFiles.length} files skipped)` : ''}`
      });
      
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "Could not generate stack export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadAdminOnly = async () => {
    setIsExporting('admin');
    
    try {
      const zip = new JSZip();
      const skippedFiles: string[] = [];

      // Admin-only files
      const adminFiles = [
        { path: '/export/admin/index.html', zipPath: 'admin/index.html' },
        { path: '/export/admin/styles.css', zipPath: 'admin/styles.css' },
        { path: '/export/admin/script.js', zipPath: 'admin/script.js' },
        { path: '/export/tools/tools-registry.json', zipPath: 'tools/tools-registry.json' },
        { path: '/export/README.md', zipPath: 'README.md' }
      ];

      // Fetch all admin files
      for (const file of adminFiles) {
        const { blob, exists } = await fetchFileAsBlob(file.path);
        if (exists) {
          zip.file(file.zipPath, blob);
        } else {
          skippedFiles.push(file.path);
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, 'vibe-admin-export.zip');

      if (skippedFiles.length > 0) {
        console.log('Skipped admin files (not found):', skippedFiles);
      }

      toast({
        title: "Admin exported successfully", 
        description: `Downloaded vibe-admin-export.zip${skippedFiles.length > 0 ? ` (${skippedFiles.length} files skipped)` : ''}`
      });
      
    } catch (error) {
      console.error('Admin export failed:', error);
      toast({
        title: "Export failed",
        description: "Could not generate admin export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Export Tools
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-medium">Complete Stack</h3>
            <p className="text-sm text-muted-foreground">
              Download the full project including landing page, admin dashboard, tools, and assets
            </p>
            <Button 
              onClick={handleDownloadCurrentStack}
              disabled={isExporting === 'stack'}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting === 'stack' ? 'Exporting...' : 'Download Current Stack'}
            </Button>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Admin Dashboard Only</h3>
            <p className="text-sm text-muted-foreground">
              Download just the admin dashboard for standalone deployment
            </p>
            <Button 
              variant="outline"
              onClick={handleDownloadAdminOnly}
              disabled={isExporting === 'admin'}
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              {isExporting === 'admin' ? 'Exporting...' : 'Download Admin Only'}
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <p className="font-medium mb-1">Export Features:</p>
          <ul className="space-y-1">
            <li>• Works fully offline with no network dependencies</li>
            <li>• Preserves folder structure and file relationships</li>
            <li>• Includes content management and tool registry</li>
            <li>• Gracefully handles missing files (logs to console)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};