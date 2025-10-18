import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Send } from "lucide-react";
import { communityManager } from "@/lib/communityManager";
import { useToast } from "@/hooks/use-toast";

interface UserResourceSubmissionProps {
  categories: string[];
  onSubmissionSuccess: () => void;
}

export const UserResourceSubmission = ({ categories, onSubmissionSuccess }: UserResourceSubmissionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    submitted_by: ""
  });

  const handleSubmit = async () => {
    if (!form.title || !form.url || !form.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await communityManager.submitUserLink(form);
      toast({
        title: "Success",
        description: "Your resource has been submitted and is pending review. Thank you for contributing!"
      });
      
      setForm({
        title: "",
        description: "",
        url: "",
        category: "",
        submitted_by: ""
      });
      setIsOpen(false);
      onSubmissionSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit resource. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Submit Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Learning Resource</DialogTitle>
          <DialogDescription>
            Share a valuable learning resource with the community. All submissions are reviewed before publication.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Resource Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Advanced React Course"
              maxLength={100}
            />
          </div>
          
          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={form.category} 
              onValueChange={(value) => setForm({ ...form, category: value })}
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
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of what this resource offers..."
              maxLength={300}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="submitted_by">Your Name (Optional)</Label>
            <Input
              id="submitted_by"
              value={form.submitted_by}
              onChange={(e) => setForm({ ...form, submitted_by: e.target.value })}
              placeholder="Your name or handle"
              maxLength={50}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Resource"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};