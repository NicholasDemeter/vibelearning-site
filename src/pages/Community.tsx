import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, BookOpen, Globe, Star, Clock } from "lucide-react";
import { communityManager, CommunityLink } from "@/lib/communityManager";
import { useCopy } from "@/hooks/useCopy";
import { UserResourceSubmission } from "@/components/UserResourceSubmission";
import chalkboardBg from "@/assets/chalkboard-bg.jpg";

const Community = () => {
  const [links, setLinks] = useState<CommunityLink[]>([]);
  const [recentLinks, setRecentLinks] = useState<CommunityLink[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { getString } = useCopy();

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    const communityLinks = await communityManager.getLinks();
    const recentCommunityLinks = await communityManager.getRecentLinks(3);
    const cats = await communityManager.getCategories();
    setLinks(communityLinks);
    setRecentLinks(recentCommunityLinks);
    setCategories(cats);
  };

  const filteredLinks = selectedCategory === "all" 
    ? links 
    : links.filter(link => link.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'courses': return <BookOpen className="h-4 w-4" />;
      case 'resources': return <Globe className="h-4 w-4" />;
      case 'communities': return <Users className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${chalkboardBg})` }}>
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            {getString("community.header", "Learning Community")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {getString("community.subcopy", "Discover external learning resources, connect with educators, and explore opportunities to earn while you learn.")}
          </p>
        </div>

        {/* Recent Additions Spotlight */}
        {recentLinks.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center justify-center gap-2 mb-2">
                <Star className="h-6 w-6 text-primary" />
                Recently Added Resources
              </h2>
              <p className="text-muted-foreground">
                Fresh learning opportunities from our community
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {recentLinks.map((link) => (
                <Card key={link.id} className="group hover:shadow-lg transition-shadow border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(link.category)}
                        <Badge variant="secondary">{link.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        New
                      </div>
                    </div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {link.title}
                    </CardTitle>
                    {link.description && (
                      <CardDescription className="text-sm line-clamp-2">
                        {link.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      asChild 
                      size="sm"
                      className="w-full" 
                      variant="outline"
                    >
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit Resource
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Submit Resource Button */}
        <div className="text-center mb-8">
          <UserResourceSubmission 
            categories={categories} 
            onSubmissionSuccess={loadCommunityData}
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            All Resources
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="flex items-center gap-2"
            >
              {getCategoryIcon(category)}
              {category}
            </Button>
          ))}
        </div>

        {/* Links Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                No learning resources available yet. Check back soon!
              </p>
            </div>
          ) : (
            filteredLinks.map((link) => (
              <Card key={link.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(link.category)}
                      <Badge variant="secondary">{link.category}</Badge>
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {link.title}
                  </CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild 
                    className="w-full" 
                    variant="outline"
                  >
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Resource
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;