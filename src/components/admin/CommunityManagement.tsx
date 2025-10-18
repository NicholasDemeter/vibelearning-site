import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, ExternalLink, Trash2, Edit, Users, Tag, Clock } from "lucide-react";
import { communityManager, CommunityLink } from "@/lib/communityManager";
import { useToast } from "@/hooks/use-toast";

export const CommunityManagement = () => {
  const [links, setLinks] = useState<CommunityLink[]>([]);
  const [pendingLinks, setPendingLinks] = useState<CommunityLink[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<CommunityLink | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();

  const [linkForm, setLinkForm] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    active: true,
    status: 'approved' as 'pending' | 'approved' | 'rejected'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const registry = await communityManager.getRegistry();
      const pending = await communityManager.getPendingLinks();
      setLinks(registry.links);
      setPendingLinks(pending);
      setCategories(registry.categories);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load community data",
        variant: "destructive"
      });
    }
  };

  const handleAddLink = async () => {
    if (!linkForm.title || !linkForm.url || !linkForm.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingLink) {
        await communityManager.updateLink(editingLink.id, linkForm);
        toast({
          title: "Success",
          description: "Community link updated successfully"
        });
      } else {
        await communityManager.addLink(linkForm);
        toast({
          title: "Success", 
          description: "Community link added successfully"
        });
      }
      
      setLinkForm({ title: "", description: "", url: "", category: "", active: true, status: 'approved' });
      setEditingLink(null);
      setIsLinkDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save community link",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await communityManager.deleteLink(id);
      toast({
        title: "Success",
        description: "Community link deleted successfully"
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to delete community link",
        variant: "destructive"
      });
    }
  };

  const handleApproveLink = async (id: string) => {
    try {
      await communityManager.updateLink(id, { status: 'approved', active: true });
      toast({
        title: "Success",
        description: "Resource approved and published"
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve resource",
        variant: "destructive"
      });
    }
  };

  const handleRejectLink = async (id: string) => {
    try {
      await communityManager.updateLink(id, { status: 'rejected', active: false });
      toast({
        title: "Success",
        description: "Resource rejected"
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject resource",
        variant: "destructive"
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }

    try {
      await communityManager.addCategory(newCategory.trim());
      toast({
        title: "Success",
        description: "Category added successfully"
      });
      setNewCategory("");
      setIsCategoryDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      await communityManager.deleteCategory(categoryName);
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const startEditLink = (link: CommunityLink) => {
    setEditingLink(link);
    setLinkForm({
      title: link.title,
      description: link.description,
      url: link.url,
      category: link.category,
      active: link.active,
      status: link.status
    });
    setIsLinkDialogOpen(true);
  };

  const resetLinkForm = () => {
    setLinkForm({ title: "", description: "", url: "", category: "", active: true, status: 'approved' });
    setEditingLink(null);
    setIsLinkDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Management
          </CardTitle>
          <CardDescription>
            Manage external learning resources and categories for the community page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetLinkForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingLink ? 'Edit Resource Link' : 'Add Resource Link'}
                  </DialogTitle>
                  <DialogDescription>
                    Add external learning resources for community members
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={linkForm.title}
                      onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                      placeholder="Resource title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description" 
                      value={linkForm.description}
                      onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                      placeholder="Brief description of the resource"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={linkForm.url}
                      onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={linkForm.category} 
                      onValueChange={(value) => setLinkForm({ ...linkForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddLink} className="flex-1">
                      {editingLink ? 'Update Link' : 'Add Link'}
                    </Button>
                    <Button variant="outline" onClick={resetLinkForm}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Tag className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Categories</DialogTitle>
                  <DialogDescription>
                    Add or remove categories for organizing resources
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newCategory">New Category</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newCategory"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Category name"
                      />
                      <Button onClick={handleAddCategory}>Add</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Existing Categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center gap-1">
                          <Badge variant="secondary">{category}</Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-1">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCategory(category)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Pending Submissions */}
      {pendingLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Submissions ({pendingLinks.length})
            </CardTitle>
            <CardDescription>
              User-submitted resources awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{link.title}</h4>
                      <Badge variant="outline">{link.category}</Badge>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {link.url}
                    </a>
                    {link.submitted_by && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted by: {link.submitted_by}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleApproveLink(link.id)}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleRejectLink(link.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links List */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Links ({links.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {links.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No resource links added yet. Add your first resource above.
              </p>
            ) : (
              links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{link.title}</h4>
                      <Badge variant="outline">{link.category}</Badge>
                      {!link.active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {link.url}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEditLink(link)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resource Link</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{link.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteLink(link.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};