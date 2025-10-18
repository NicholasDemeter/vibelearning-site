// Tool Registry Management System
// Handles dynamic registration and management of HTML tools

export interface Tool {
  id: string;
  name: string;
  description: string;
  filepath: string;
  category: string;
  active: boolean;
  uploaded_date: string;
  version: string;
  type: 'single' | 'multi-file' | 'source-stack';
  files?: {
    'index.html': string;
    'styles.css'?: string;
    'script.js'?: string;
    'config.json'?: string;
  };
  sourceFiles?: Record<string, string>; // For source-stack type
}

export interface ToolRegistry {
  tools: Tool[];
  last_updated: string;
}

class ToolRegistryManager {
  private readonly STORAGE_KEY = 'tool_registry';
  private readonly DEFAULT_REGISTRY: ToolRegistry = {
    tools: [],
    last_updated: new Date().toISOString()
  };

  /**
   * Get the current tool registry from localStorage
   */
  async getRegistry(): Promise<ToolRegistry> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.DEFAULT_REGISTRY;
    } catch (error) {
      console.error('Failed to load tool registry:', error);
      return this.DEFAULT_REGISTRY;
    }
  }

  /**
   * Save the tool registry to localStorage
   */
  private async saveRegistry(registry: ToolRegistry): Promise<void> {
    try {
      registry.last_updated = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registry, null, 2));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('toolRegistryUpdated'));
    } catch (error) {
      console.error('Failed to save tool registry:', error);
      throw new Error('Failed to save tool registry');
    }
  }

  /**
   * Get all tools from the registry
   */
  async getTools(): Promise<Tool[]> {
    const registry = await this.getRegistry();
    return registry.tools;
  }

  /**
   * Get active tools only
   */
  async getActiveTools(): Promise<Tool[]> {
    const tools = await this.getTools();
    return tools.filter(tool => tool.active);
  }

  /**
   * Get tools by category
   */
  async getToolsByCategory(category: string): Promise<Tool[]> {
    const tools = await this.getTools();
    return tools.filter(tool => tool.category === category && tool.active);
  }

  /**
   * Get a specific tool by ID
   */
  async getTool(id: string): Promise<Tool | null> {
    const tools = await this.getTools();
    return tools.find(tool => tool.id === id) || null;
  }

  /**
   * Add a new tool to the registry
   */
  async addTool(toolData: {
    name: string;
    description: string;
    category: string;
    version: string;
    content?: string;
    filename?: string;
    files?: {
      'index.html': string;
      'styles.css'?: string;
      'script.js'?: string;
      'config.json'?: string;
    };
    sourceFiles?: Record<string, string>;
    type?: 'single' | 'multi-file' | 'source-stack';
  }): Promise<string> {
    try {
      const registry = await this.getRegistry();
      
      // Generate unique ID
      const id = this.generateToolId(toolData.name);
      
      const isMultiFile = toolData.type === 'multi-file' || toolData.files;
      const isSourceStack = toolData.type === 'source-stack' || toolData.sourceFiles;
      
      // Create filepath (simulated for client-side)
      const filepath = isMultiFile || isSourceStack ? `/tools/${id}/` : `/tools/${id}.html`;

      if (isSourceStack && toolData.sourceFiles) {
        // Store source-stack project files
        localStorage.setItem(`tool_source_${id}`, JSON.stringify(toolData.sourceFiles));
      } else if (isMultiFile && toolData.files) {
        // Store multi-file project
        localStorage.setItem(`tool_files_${id}`, JSON.stringify(toolData.files));
      } else if (toolData.content) {
        // Store single HTML file
        localStorage.setItem(`tool_content_${id}`, toolData.content);
      } else {
        throw new Error('No content or files provided');
      }

      const newTool: Tool = {
        id,
        name: toolData.name,
        description: toolData.description,
        filepath,
        category: toolData.category,
        active: true,
        uploaded_date: new Date().toISOString(),
        version: toolData.version,
        type: isSourceStack ? 'source-stack' : (isMultiFile ? 'multi-file' : 'single'),
        files: toolData.files,
        sourceFiles: toolData.sourceFiles
      };

      registry.tools.push(newTool);
      await this.saveRegistry(registry);

      return id;
    } catch (error) {
      console.error('Failed to add tool:', error);
      throw new Error('Failed to add tool to registry');
    }
  }

  /**
   * Update tool metadata
   */
  async updateTool(id: string, updates: Partial<Omit<Tool, 'id' | 'uploaded_date'>>): Promise<void> {
    try {
      const registry = await this.getRegistry();
      const toolIndex = registry.tools.findIndex(tool => tool.id === id);
      
      if (toolIndex === -1) {
        throw new Error('Tool not found');
      }

      registry.tools[toolIndex] = {
        ...registry.tools[toolIndex],
        ...updates
      };

      await this.saveRegistry(registry);
    } catch (error) {
      console.error('Failed to update tool:', error);
      throw new Error('Failed to update tool');
    }
  }

  /**
   * Toggle tool active status
   */
  async toggleToolStatus(id: string): Promise<void> {
    try {
      const registry = await this.getRegistry();
      const tool = registry.tools.find(tool => tool.id === id);
      
      if (!tool) {
        throw new Error('Tool not found');
      }

      tool.active = !tool.active;
      await this.saveRegistry(registry);
    } catch (error) {
      console.error('Failed to toggle tool status:', error);
      throw new Error('Failed to toggle tool status');
    }
  }

  /**
   * Delete a tool from the registry
   */
  async deleteTool(id: string): Promise<void> {
    try {
      const registry = await this.getRegistry();
      const initialLength = registry.tools.length;
      
      registry.tools = registry.tools.filter(tool => tool.id !== id);
      
      if (registry.tools.length === initialLength) {
        throw new Error('Tool not found');
      }

      // Remove tool content from localStorage
      localStorage.removeItem(`tool_content_${id}`);
      localStorage.removeItem(`tool_files_${id}`);
      localStorage.removeItem(`tool_source_${id}`);
      
      await this.saveRegistry(registry);
    } catch (error) {
      console.error('Failed to delete tool:', error);
      throw new Error('Failed to delete tool');
    }
  }

  /**
   * Get tool content (simulated file reading)
   */
  async getToolContent(id: string): Promise<string | null> {
    try {
      return localStorage.getItem(`tool_content_${id}`);
    } catch (error) {
      console.error('Failed to get tool content:', error);
      return null;
    }
  }

  /**
   * Get tool files for multi-file projects
   */
  async getToolFiles(id: string): Promise<{
    'index.html': string;
    'styles.css'?: string;
    'script.js'?: string;
    'config.json'?: string;
  } | null> {
    try {
      const filesData = localStorage.getItem(`tool_files_${id}`);
      return filesData ? JSON.parse(filesData) : null;
    } catch (error) {
      console.error('Failed to get tool files:', error);
      return null;
    }
  }

  /**
   * Get source files for source-stack projects
   */
  async getToolSourceFiles(id: string): Promise<Record<string, string> | null> {
    try {
      const stored = localStorage.getItem(`tool_source_${id}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get source files:', error);
      return null;
    }
  }

  /**
   * Generate unique tool ID from name
   */
  private generateToolId(name: string): string {
    const baseId = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const timestamp = Date.now().toString(36);
    return `${baseId}-${timestamp}`;
  }

  /**
   * Export registry as JSON (for backup/migration)
   */
  async exportRegistry(): Promise<string> {
    const registry = await this.getRegistry();
    return JSON.stringify(registry, null, 2);
  }

  /**
   * Import registry from JSON (for backup/migration)
   */
  async importRegistry(jsonData: string): Promise<void> {
    try {
      const registry = JSON.parse(jsonData) as ToolRegistry;
      
      // Validate registry structure
      if (!registry.tools || !Array.isArray(registry.tools)) {
        throw new Error('Invalid registry format');
      }

      await this.saveRegistry(registry);
    } catch (error) {
      console.error('Failed to import registry:', error);
      throw new Error('Failed to import registry');
    }
  }

  /**
   * Clear all tools (for development/testing)
   */
  async clearRegistry(): Promise<void> {
    await this.saveRegistry(this.DEFAULT_REGISTRY);
    
    // Clear all tool content and files
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('tool_content_') || key.startsWith('tool_files_')
    );
    keys.forEach(key => localStorage.removeItem(key));
  }
}

// Export singleton instance
export const toolRegistryManager = new ToolRegistryManager();