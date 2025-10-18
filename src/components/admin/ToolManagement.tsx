import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, MoreVertical, Eye, Edit2, Power, PowerOff, Trash2, FileText, Archive, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toolRegistryManager, Tool } from "@/lib/toolRegistry";

export const ToolManagement = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [previewTool, setPreviewTool] = useState<Tool | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [tools, searchQuery, selectedCategory]);

  const loadTools = async () => {
    try {
      const allTools = await toolRegistryManager.getTools();
      setTools(allTools);
    } catch (error) {
      toast({
        title: "Error loading tools",
        description: "Failed to load tools from registry",
        variant: "destructive"
      });
    }
  };

  const filterTools = () => {
    let filtered = [...tools];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    setFilteredTools(filtered);
  };

  const handlePreview = async (tool: Tool) => {
    setPreviewTool(tool);
    setIsLoadingPreview(true);
    
    try {
      if (tool.type === 'single') {
        const content = await toolRegistryManager.getToolContent(tool.id);
        setPreviewContent(content || "");
      } else {
        const files = await toolRegistryManager.getToolFiles(tool.id);
        if (files) {
          // Create a complete HTML document for multi-file projects
          let html = files['index.html'];
          
          // Inject CSS if available
          if (files['styles.css']) {
            html = html.replace('</head>', `<style>${files['styles.css']}</style></head>`);
          }
          
          // Inject JavaScript if available
          if (files['script.js']) {
            html = html.replace('</body>', `<script>${files['script.js']}</script></body>`);
          }
          
          setPreviewContent(html);
        } else {
          setPreviewContent("");
        }
      }
    } catch (error) {
      toast({
        title: "Preview failed",
        description: "Failed to load tool content for preview",
        variant: "destructive"
      });
      setPreviewContent("");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleToggleStatus = async (toolId: string) => {
    try {
      await toolRegistryManager.toggleToolStatus(toolId);
      await loadTools(); // Reload tools
      toast({
        title: "Status updated",
        description: "Tool status has been updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Failed to update tool status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (confirm("Are you sure you want to delete this tool? This action cannot be undone.")) {
      try {
        await toolRegistryManager.deleteTool(toolId);
        await loadTools(); // Reload tools
        toast({
          title: "Tool deleted",
          description: "Tool has been deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error deleting tool",
          description: "Failed to delete tool",
          variant: "destructive"
        });
      }
    }
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>
    );
  };

  const categories = Array.from(new Set(tools.map(tool => tool.category)));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{tools.length}</span>
              <span className="text-sm text-muted-foreground">Total Tools</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-green-600">
                {tools.filter(t => t.active).length}
              </span>
              <span className="text-sm text-muted-foreground">Active Tools</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-red-600">
                {tools.filter(t => !t.active).length}
              </span>
              <span className="text-sm text-muted-foreground">Inactive Tools</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{categories.length}</span>
              <span className="text-sm text-muted-foreground">Categories</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools Management */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Management</CardTitle>
          <CardDescription>
            Manage uploaded tools, their status, and metadata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search tools</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="category-filter" className="sr-only">Filter by category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tools Table */}
          {filteredTools.length === 0 ? (
            <Alert>
              <AlertDescription>
                {tools.length === 0 
                  ? "No tools have been uploaded yet. Use the Upload tab to add your first tool."
                  : "No tools match your current filters. Try adjusting your search or category filter."
                }
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTools.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {tool.type === 'multi-file' ? (
                                <Archive className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              )}
                              {tool.name}
                            </div>
                            {tool.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {tool.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{tool.version}</TableCell>
                      <TableCell>{getStatusBadge(tool.active)}</TableCell>
                      <TableCell>
                        {new Date(tool.uploaded_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border border-border">
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handlePreview(tool)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Metadata
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleToggleStatus(tool.id)}
                            >
                              {tool.active ? (
                                <>
                                  <PowerOff className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer text-red-600"
                              onClick={() => handleDeleteTool(tool.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewTool} onOpenChange={() => setPreviewTool(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTool?.type === 'multi-file' ? (
                <Archive className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
              Preview: {previewTool?.name}
            </DialogTitle>
            <DialogDescription>
              {previewTool?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading preview...
              </div>
            ) : (
              <>
                <div className="border rounded-lg bg-background">
                  <iframe
                    srcDoc={previewContent}
                    className="w-full h-96 border-0 rounded-lg"
                    title={`Preview of ${previewTool?.name}`}
                    sandbox="allow-scripts"
                  />
                </div>
                
                {previewTool?.type === 'multi-file' && previewTool.files && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Project Files:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {Object.entries(previewTool.files).map(([filename, content]) => (
                        <div key={filename} className="flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          <span>{filename}</span>
                          <span className="text-muted-foreground">
                            ({(typeof content === 'string' ? content.length / 1024 : 0).toFixed(1)} KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};