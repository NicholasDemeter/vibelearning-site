import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit3, Save, X, Download, Upload, Copy, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { copyManager } from "@/lib/copyManager";

export const ContentManagement = () => {
  const [flatStrings, setFlatStrings] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      await copyManager.loadStrings();
      const flattened = copyManager.flattenStrings();
      setFlatStrings(flattened);
    } catch (error) {
      toast({
        title: "Failed to load content",
        description: "Could not load copy strings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStrings = Object.entries(flatStrings).filter(([key, value]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  const handleSave = () => {
    if (!editingKey) return;

    copyManager.updateString(editingKey, editValue);
    setFlatStrings(prev => ({ ...prev, [editingKey]: editValue }));
    setEditingKey(null);
    setEditValue("");

    toast({
      title: "Content updated",
      description: "Changes saved to localStorage. Refresh to see updates."
    });
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue("");
  };

  const handleExport = () => {
    const jsonString = copyManager.exportAllStrings();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'strings.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: "strings.json downloaded successfully"
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          copyManager.importStrings(content);
          loadContent();
          
          toast({
            title: "Import successful",
            description: "Content updated from imported file"
          });
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Invalid JSON file format",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleCopyJson = () => {
    const jsonString = copyManager.exportAllStrings();
    navigator.clipboard.writeText(jsonString).then(() => {
      toast({
        title: "JSON copied",
        description: "Full JSON copied to clipboard"
      });
    });
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="w-5 h-5" />
          Content Management
        </CardTitle>
        <div className="flex items-center gap-4 pt-4">
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyJson}>
              <Copy className="w-4 h-4 mr-2" />
              Copy JSON
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-96 overflow-auto">
        {filteredStrings.map(([key, value]) => (
          <div key={key} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs font-mono">
                {key}
              </Badge>
            </div>
            
            {editingKey === key ? (
              <div className="space-y-3">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={3}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm bg-muted p-3 rounded flex-1 font-mono">
                  {value}
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEdit(key, value)}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
        
        {filteredStrings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No content found matching "{searchTerm}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};