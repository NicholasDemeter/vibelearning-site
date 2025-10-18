import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Edit3, Save, RotateCcw, Plus, Trash2, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contentManager, ContentItem, ContentStyle } from "@/lib/contentManager";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const ContentEditor = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<ContentItem>>({
    category: "admin",
    label: "",
    value: "",
    description: ""
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const categories = ["all", "admin", "custom"];

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const content = await contentManager.getContent();
      setContentItems(content);
    } catch (error) {
      toast({
        title: "Failed to load content",
        description: "Could not load editable content items",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = selectedCategory === "all" 
    ? contentItems 
    : contentItems.filter(item => item.category === selectedCategory);

  const handleEdit = (item: ContentItem) => {
    setEditingItem({ ...item });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      await contentManager.updateContent(editingItem.key, editingItem.value, editingItem.style);
      await loadContent();
      setEditingItem(null);
      
      toast({
        title: "Content updated",
        description: `"${editingItem.label}" has been updated successfully`
      });
    } catch (error) {
      toast({
        title: "Failed to update",
        description: "Could not save content changes",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
  };

  const handleAddNew = async () => {
    if (!newItem.label || !newItem.value) {
      toast({
        title: "Missing information",
        description: "Please provide both label and value",
        variant: "destructive"
      });
      return;
    }

    try {
      await contentManager.addContent(newItem as ContentItem);
      await loadContent();
      setNewItem({
        category: "custom",
        label: "",
        value: "",
        description: ""
      });
      
      toast({
        title: "Content added",
        description: `"${newItem.label}" has been added successfully`
      });
    } catch (error) {
      toast({
        title: "Failed to add",
        description: "Could not add new content item",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await contentManager.deleteContent(key);
      await loadContent();
      
      toast({
        title: "Content deleted",
        description: "Content item has been removed"
      });
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: "Could not delete content item",
        variant: "destructive"
      });
    }
  };

  const handleReset = async () => {
    try {
      await contentManager.resetToDefaults();
      await loadContent();
      
      toast({
        title: "Content reset",
        description: "All content has been reset to defaults"
      });
    } catch (error) {
      toast({
        title: "Failed to reset",
        description: "Could not reset content to defaults",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading content...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Content Editor
          </CardTitle>
          <CardDescription>
            Edit text content throughout the admin interface without code changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Filter & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label htmlFor="category-filter">Filter by category:</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>

          <Separator />

          {/* Content Items List */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.key} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{item.label}</h4>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description}
                      </p>
                    )}
                    
                    {editingItem?.key === item.key ? (
                      <div className="space-y-3">
                        <div>
                          <Label>Content Text</Label>
                          <Textarea
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({
                              ...editingItem,
                              value: e.target.value
                            })}
                            rows={3}
                            className="font-mono text-sm"
                          />
                        </div>
                        
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <Palette className="w-3 h-3 mr-2" />
                              Text Styling Options
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-3 mt-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Text Color</Label>
                                <Input
                                  type="color"
                                  value={editingItem.style?.color || "#000000"}
                                  onChange={(e) => setEditingItem({
                                    ...editingItem,
                                    style: { ...editingItem.style, color: e.target.value }
                                  })}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Font Size</Label>
                                <Input
                                  type="text"
                                  placeholder="e.g., 16px, 1.5rem"
                                  value={editingItem.style?.fontSize || ""}
                                  onChange={(e) => setEditingItem({
                                    ...editingItem,
                                    style: { ...editingItem.style, fontSize: e.target.value }
                                  })}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Text Align</Label>
                                <Select
                                  value={editingItem.style?.textAlign || "left"}
                                  onValueChange={(value) => setEditingItem({
                                    ...editingItem,
                                    style: { ...editingItem.style, textAlign: value }
                                  })}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">Font Weight</Label>
                                <Select
                                  value={editingItem.style?.fontWeight || "normal"}
                                  onValueChange={(value) => setEditingItem({
                                    ...editingItem,
                                    style: { ...editingItem.style, fontWeight: value }
                                  })}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="300">Light</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="500">Medium</SelectItem>
                                    <SelectItem value="600">Semibold</SelectItem>
                                    <SelectItem value="bold">Bold</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full"
                              onClick={() => setEditingItem({
                                ...editingItem,
                                style: undefined
                              })}
                            >
                              Clear All Styles
                            </Button>
                          </CollapsibleContent>
                        </Collapsible>
                        
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSave}>
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-sm bg-muted p-2 rounded font-mono flex-1 mr-4">
                          {item.value}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          {item.category === "custom" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(item.key)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Add New Content Item */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Content Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-label">Label *</Label>
                  <Input
                    id="new-label"
                    value={newItem.label}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                    placeholder="Display name for this content"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-category">Category</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-value">Content Value *</Label>
                <Textarea
                  id="new-value"
                  value={newItem.value}
                  onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                  placeholder="The actual text content that will be displayed"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-description">Description</Label>
                <Input
                  id="new-description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Optional description of where this content is used"
                />
              </div>

              <Button onClick={handleAddNew} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Content Item
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};