// Content Management System for editable text
// Allows dynamic editing of UI text without code changes

export interface ContentStyle {
  color?: string;
  fontSize?: string;
  textAlign?: string;
  fontWeight?: string;
}

export interface ContentItem {
  key: string;
  label: string;
  value: string;
  category: string;
  description?: string;
  style?: ContentStyle;
}

export interface ContentRegistry {
  items: ContentItem[];
  last_updated: string;
}

const DEFAULT_CONTENT: ContentItem[] = [
  // Admin Dashboard Content
  {
    key: "admin.dashboard.title",
    label: "Dashboard Title", 
    value: "Admin Dashboard",
    category: "admin",
    description: "Main title for the admin dashboard"
  },
  {
    key: "admin.dashboard.subtitle",
    label: "Dashboard Subtitle",
    value: "HTML Tool Management System", 
    category: "admin",
    description: "Subtitle text for the admin dashboard"
  },
  // Tool Upload Content
  {
    key: "admin.upload.title",
    label: "Upload Section Title",
    value: "Upload HTML Tool",
    category: "admin",
    description: "Title for the tool upload section"
  },
  {
    key: "admin.upload.description", 
    label: "Upload Description",
    value: "Upload and manage HTML-based tools for the knowledge repository",
    category: "admin",
    description: "Description text for the upload section"
  },
  {
    key: "admin.upload.dropzone.title",
    label: "Dropzone Title",
    value: "Drag & drop HTML or ZIP file here",
    category: "admin",
    description: "Main text shown in the file drop zone"
  },
  {
    key: "admin.upload.dropzone.subtitle",
    label: "Dropzone Subtitle", 
    value: "or click to browse files",
    category: "admin",
    description: "Secondary text shown in the file drop zone"
  },
  {
    key: "admin.upload.size.limits",
    label: "File Size Limits",
    value: "HTML files (max 5MB) or ZIP files (max 10MB)",
    category: "admin",
    description: "File size limit information"
  },
  {
    key: "admin.upload.zip.requirements",
    label: "ZIP Requirements",
    value: "ZIP files must contain index.html and optional styles.css, script.js, config.json",
    category: "admin", 
    description: "ZIP file requirements text"
  },
  // Tool Management Content
  {
    key: "admin.management.title",
    label: "Tool Management Title",
    value: "Tool Management",
    category: "admin",
    description: "Title for the tool management section"
  },
  {
    key: "admin.management.description",
    label: "Tool Management Description", 
    value: "Manage uploaded tools, view status, and configure settings",
    category: "admin",
    description: "Description for the tool management section"
  },
  // Settings Content
  {
    key: "admin.settings.title",
    label: "Settings Title",
    value: "System Settings", 
    category: "admin",
    description: "Title for the settings section"
  },
  {
    key: "admin.settings.description",
    label: "Settings Description",
    value: "Configure admin preferences and system settings",
    category: "admin",
    description: "Description for the settings section"
  }
];

class ContentManager {
  private readonly STORAGE_KEY = 'content_registry';
  private readonly DEFAULT_REGISTRY: ContentRegistry = {
    items: DEFAULT_CONTENT,
    last_updated: new Date().toISOString()
  };

  /**
   * Get the current content registry
   */
  async getRegistry(): Promise<ContentRegistry> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const registry = JSON.parse(stored);
        // Merge with default content for any missing items
        const existingKeys = new Set(registry.items.map((item: ContentItem) => item.key));
        const missingItems = DEFAULT_CONTENT.filter(item => !existingKeys.has(item.key));
        
        if (missingItems.length > 0) {
          registry.items.push(...missingItems);
          await this.saveRegistry(registry);
        }
        
        return registry;
      }
      return this.DEFAULT_REGISTRY;
    } catch (error) {
      console.error('Failed to load content registry:', error);
      return this.DEFAULT_REGISTRY;
    }
  }

  /**
   * Save the content registry
   */
  private async saveRegistry(registry: ContentRegistry): Promise<void> {
    try {
      registry.last_updated = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registry, null, 2));
      // Dispatch event to notify components of content updates
      window.dispatchEvent(new CustomEvent('contentUpdated'));
    } catch (error) {
      console.error('Failed to save content registry:', error);
      throw new Error('Failed to save content registry');
    }
  }

  /**
   * Get all content items
   */
  async getContent(): Promise<ContentItem[]> {
    const registry = await this.getRegistry();
    return registry.items;
  }

  /**
   * Get content by category
   */
  async getContentByCategory(category: string): Promise<ContentItem[]> {
    const content = await this.getContent();
    return content.filter(item => item.category === category);
  }

  /**
   * Get specific content item by key
   */
  async getContentItem(key: string): Promise<string> {
    const content = await this.getContent();
    const item = content.find(item => item.key === key);
    return item?.value || key; // Fallback to key if not found
  }

  /**
   * Update content item
   */
  async updateContent(key: string, value: string, style?: ContentStyle): Promise<void> {
    try {
      const registry = await this.getRegistry();
      const itemIndex = registry.items.findIndex(item => item.key === key);
      
      if (itemIndex === -1) {
        throw new Error('Content item not found');
      }

      registry.items[itemIndex].value = value;
      if (style !== undefined) {
        registry.items[itemIndex].style = style;
      }
      await this.saveRegistry(registry);
    } catch (error) {
      console.error('Failed to update content:', error);
      throw new Error('Failed to update content');
    }
  }

  /**
   * Add new content item
   */
  async addContent(item: Omit<ContentItem, 'key'> & { key?: string }): Promise<void> {
    try {
      const registry = await this.getRegistry();
      
      const newItem: ContentItem = {
        key: item.key || `custom.${Date.now()}`,
        label: item.label,
        value: item.value,
        category: item.category,
        description: item.description
      };

      registry.items.push(newItem);
      await this.saveRegistry(registry);
    } catch (error) {
      console.error('Failed to add content:', error);
      throw new Error('Failed to add content');
    }
  }

  /**
   * Delete content item
   */
  async deleteContent(key: string): Promise<void> {
    try {
      const registry = await this.getRegistry();
      const initialLength = registry.items.length;
      
      registry.items = registry.items.filter(item => item.key !== key);
      
      if (registry.items.length === initialLength) {
        throw new Error('Content item not found');
      }

      await this.saveRegistry(registry);
    } catch (error) {
      console.error('Failed to delete content:', error);
      throw new Error('Failed to delete content');
    }
  }

  /**
   * Reset to default content
   */
  async resetToDefaults(): Promise<void> {
    await this.saveRegistry(this.DEFAULT_REGISTRY);
  }
}

// Export singleton instance
export const contentManager = new ContentManager();