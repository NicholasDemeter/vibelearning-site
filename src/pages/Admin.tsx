import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolUpload } from "@/components/admin/ToolUpload";
import { ToolManagement } from "@/components/admin/ToolManagement";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { ExportTools } from "@/components/admin/ExportTools";
import { VideoManagement } from "@/components/admin/VideoManagement";
import { CommunityManagement } from "@/components/admin/CommunityManagement";
import { Badge } from "@/components/ui/badge";
import { Settings, Upload, Database, Users, Edit3 } from "lucide-react";
import chalkboardBg from "@/assets/chalkboard-bg.jpg";

const Admin = () => {
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${chalkboardBg})` }}>
      <div className="container mx-auto px-4 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                HTML Tool Management System
              </p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Users className="w-4 h-4 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="upload">Upload Tools</TabsTrigger>
            <TabsTrigger value="manage">Manage Tools</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="text">Text Editor</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <ToolUpload />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <ToolManagement />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="text" className="space-y-6">
            <ContentEditor />
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            <VideoManagement />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CommunityManagement />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <ExportTools />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;