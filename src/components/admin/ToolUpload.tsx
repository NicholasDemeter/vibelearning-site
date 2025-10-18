import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, CheckCircle, Eye, Archive, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toolRegistryManager } from "@/lib/toolRegistry";

interface ToolMetadata {
  name: string;
  description: string;
  category: string;
  version: string;
}

interface UploadedFile {
  file: File;
  content?: string;
  files?: {
    'index.html': string;
    'styles.css'?: string;
    'script.js'?: string;
    'config.json'?: string;
  };
  sourceFiles?: Record<string, string>; // For source-stack type
  metadata: ToolMetadata;
  type: 'single' | 'multi-file' | 'source-stack';
}

const CATEGORIES = [
  "productivity",
  "education", 
  "utilities",
  "entertainment",
  "development",
  "design",
  "other"
];

export const ToolUpload = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [metadata, setMetadata] = useState<ToolMetadata>({
    name: "",
    description: "",
    category: "",
    version: "1.0.0"
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const processZipFile = async (file: File): Promise<{
    type: 'multi-file' | 'source-stack';
    files?: {
      'index.html': string;
      'styles.css'?: string;
      'script.js'?: string;
      'config.json'?: string;
    };
    sourceFiles?: Record<string, string>;
  }> => {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    // Check if this is a source-stack (contains package.json and src/)
    const hasPackageJson = zipContent.files['package.json'] !== undefined;
    const hasSrcFolder = Object.keys(zipContent.files).some(name => name.startsWith('src/'));
    
    if (hasPackageJson && hasSrcFolder) {
      // Process as source-stack
      const sourceFiles: Record<string, string> = {};
      
      for (const [path, zipFile] of Object.entries(zipContent.files)) {
        if (!zipFile.dir) {
          sourceFiles[path] = await zipFile.async('text');
        }
      }
      
      return {
        type: 'source-stack',
        sourceFiles
      };
    } else {
      // Process as multi-file HTML project
      const files: any = {};
      const requiredFiles = ['index.html'];
      const optionalFiles = ['styles.css', 'script.js', 'config.json'];
      
      // Check for required files
      for (const fileName of requiredFiles) {
        const zipFile = zipContent.files[fileName];
        if (!zipFile) {
          throw new Error(`Required file missing: ${fileName}`);
        }
        files[fileName] = await zipFile.async('text');
      }
      
      // Process optional files
      for (const fileName of optionalFiles) {
        const zipFile = zipContent.files[fileName];
        if (zipFile) {
          files[fileName] = await zipFile.async('text');
        }
      }
      
      return {
        type: 'multi-file',
        files
      };
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;

    const isZipFile = file.name.endsWith('.zip');
    const isHtmlFile = file.name.endsWith('.html');

    // Validate file type
    if (!isZipFile && !isHtmlFile) {
      toast({
        title: "Invalid file type",
        description: "Please upload HTML files (.html) or ZIP files (.zip)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit for ZIP, 5MB for HTML)
    const sizeLimit = isZipFile ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > sizeLimit) {
      toast({
        title: "File too large",
        description: `File size must be less than ${isZipFile ? '10MB' : '5MB'}`,
        variant: "destructive"
      });
      return;
    }

    try {
      if (isZipFile) {
        // Process ZIP file
        const result = await processZipFile(file);
        
        if (result.type === 'source-stack') {
          setUploadedFile({ 
            file, 
            sourceFiles: result.sourceFiles,
            metadata, 
            type: 'source-stack' 
          });
          
          // Auto-populate name from package.json if available
          const packageJson = result.sourceFiles?.['package.json'];
          if (packageJson) {
            try {
              const pkg = JSON.parse(packageJson);
              if (pkg.name) {
                setMetadata(prev => ({
                  ...prev,
                  name: prev.name || pkg.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  description: prev.description || pkg.description || '',
                  version: pkg.version || prev.version
                }));
              }
            } catch (e) {
              console.error('Failed to parse package.json:', e);
            }
          }
          
          const fileCount = result.sourceFiles ? Object.keys(result.sourceFiles).length : 0;
          toast({
            title: "Source stack processed successfully",
            description: `Detected React/TypeScript project with ${fileCount} files. This will be available for download.`
          });
        } else {
          setUploadedFile({ 
            file, 
            files: result.files, 
            metadata, 
            type: 'multi-file' 
          });
          
          // Auto-populate name from filename
          const filename = file.name.replace('.zip', '');
          setMetadata(prev => ({
            ...prev,
            name: prev.name || filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          }));

          toast({
            title: "ZIP file processed successfully",
            description: `Found ${result.files ? Object.keys(result.files).length : 0} files. Please fill in the metadata below.`
          });
        }
      } else {
        // Process HTML file
        const content = await file.text();
        
        // Basic HTML validation
        if (!content.includes('<html') && !content.includes('<!DOCTYPE')) {
          toast({
            title: "Invalid HTML",
            description: "File doesn't appear to be valid HTML",
            variant: "destructive"
          });
          return;
        }

        setUploadedFile({ 
          file, 
          content, 
          metadata, 
          type: 'single' 
        });
        
        // Auto-populate name from filename
        const filename = file.name.replace('.html', '');
        setMetadata(prev => ({
          ...prev,
          name: prev.name || filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }));

        toast({
          title: "HTML file uploaded successfully",
          description: "Please fill in the metadata below"
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    }
  }, [toast, metadata]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html'],
      'application/zip': ['.zip']
    },
    maxFiles: 1
  });

  const handleMetadataChange = (field: keyof ToolMetadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    if (uploadedFile) {
      setUploadedFile(prev => prev ? { ...prev, metadata: { ...prev.metadata, [field]: value } } : null);
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
  };

  const handlePublish = async () => {
    if (!uploadedFile || !metadata.name || !metadata.category) {
      toast({
        title: "Missing information",
        description: "Please provide tool name and category",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate tool publishing
      const toolId = await toolRegistryManager.addTool({
        name: metadata.name,
        description: metadata.description,
        category: metadata.category,
        version: metadata.version,
        type: uploadedFile.type,
        ...(uploadedFile.type === 'single' 
          ? { content: uploadedFile.content, filename: uploadedFile.file.name }
          : uploadedFile.type === 'source-stack'
          ? { sourceFiles: uploadedFile.sourceFiles }
          : { files: uploadedFile.files }
        )
      });

      toast({
        title: "Tool published successfully",
        description: `Tool "${metadata.name}" has been added to the registry`
      });

      // Reset form
      setUploadedFile(null);
      setMetadata({ name: "", description: "", category: "", version: "1.0.0" });
      setIsPreviewMode(false);
    } catch (error) {
      toast({
        title: "Publishing failed",
        description: "Failed to publish tool to registry",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload HTML Tool
          </CardTitle>
          <CardDescription>
            Upload and manage HTML-based tools for the knowledge repository
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              {isDragActive ? (
                <p className="text-lg">Drop the HTML file here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium">Drag & drop HTML or ZIP file here</p>
                  <p className="text-muted-foreground">or click to browse files</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    HTML files (max 5MB) or ZIP files (max 10MB)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ZIP with index.html for HTML projects • ZIP with package.json + src/ for React/TS source stacks
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* File Info */}
          {uploadedFile && (
            <Alert>
              {uploadedFile.type === 'source-stack' ? (
                <FileCode className="h-4 w-4" />
              ) : uploadedFile.type === 'multi-file' ? (
                <Archive className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <AlertDescription className="flex items-center justify-between">
                <span>
                  <strong>{uploadedFile.file.name}</strong> ({(uploadedFile.file.size / 1024).toFixed(1)} KB)
                  {uploadedFile.type === 'multi-file' && uploadedFile.files && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Files: {Object.keys(uploadedFile.files).join(', ')}
                    </div>
                  )}
                  {uploadedFile.type === 'source-stack' && uploadedFile.sourceFiles && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Source project with {Object.keys(uploadedFile.sourceFiles).length} files
                    </div>
                  )}
                </span>
                <Badge variant="secondary">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {uploadedFile.type === 'source-stack' ? 'Valid Source Stack' : uploadedFile.type === 'multi-file' ? 'Valid ZIP Project' : 'Valid HTML'}
                </Badge>
              </AlertDescription>
            </Alert>
          )}

          {/* Metadata Form */}
          {uploadedFile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tool-name">Tool Name *</Label>
                <Input
                  id="tool-name"
                  value={metadata.name}
                  onChange={(e) => handleMetadataChange("name", e.target.value)}
                  placeholder="Enter tool display name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tool-category">Category *</Label>
                <Select
                  value={metadata.category}
                  onValueChange={(value) => handleMetadataChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tool-version">Version</Label>
                <Input
                  id="tool-version"
                  value={metadata.version}
                  onChange={(e) => handleMetadataChange("version", e.target.value)}
                  placeholder="1.0.0"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tool-description">Description</Label>
                <Textarea
                  id="tool-description"
                  value={metadata.description}
                  onChange={(e) => handleMetadataChange("description", e.target.value)}
                  placeholder="Brief description of the tool's functionality"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          {uploadedFile && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!metadata.name || !metadata.category || isUploading}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? "Publishing..." : "Publish Tool"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {isPreviewMode && uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Tool Preview</CardTitle>
            <CardDescription>Preview of {metadata.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-background">
              <iframe
                srcDoc={uploadedFile.type === 'single' 
                  ? uploadedFile.content 
                  : uploadedFile.files?.['index.html']
                }
                className="w-full h-96 border-0"
                title="Tool Preview"
                sandbox="allow-scripts"
              />
            </div>
            {uploadedFile.type === 'multi-file' && uploadedFile.files && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Project Files:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(uploadedFile.files).map(([filename, content]) => (
                    <div key={filename} className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      <span>{filename}</span>
                      <span className="text-muted-foreground">({(content.length / 1024).toFixed(1)} KB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
                Close Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};