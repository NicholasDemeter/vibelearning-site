export interface CommunityLink {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  active: boolean;
  created_date: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by?: string;
}

export interface CommunityRegistry {
  links: CommunityLink[];
  categories: string[];
  last_updated: string;
}

const DEFAULT_CATEGORIES = ["Courses", "Resources", "Communities", "Earning Opportunities"];

const DEFAULT_LINKS: CommunityLink[] = [
  {
    id: "1",
    title: "Coursera AI for Everyone",
    description: "Learn the basics of AI and machine learning from industry experts",
    url: "https://www.coursera.org/learn/ai-for-everyone",
    category: "Courses",
    active: true,
    created_date: new Date().toISOString(),
    status: 'approved'
  },
  {
    id: "2", 
    title: "Khan Academy",
    description: "Free online courses, lessons and practice in various subjects",
    url: "https://www.khanacademy.org",
    category: "Resources",
    active: true,
    created_date: new Date().toISOString(),
    status: 'approved'
  },
  {
    id: "3",
    title: "freeCodeCamp",
    description: "Learn to code for free and build projects while earning certifications",
    url: "https://www.freecodecamp.org",
    category: "Earning Opportunities",
    active: true,
    created_date: new Date().toISOString(),
    status: 'approved'
  }
];

export class CommunityManager {
  private storageKey = 'community-registry';

  async getRegistry(): Promise<CommunityRegistry> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const registry = JSON.parse(stored);
        // Merge with defaults to ensure new categories/links are included
        return {
          links: [...DEFAULT_LINKS, ...registry.links.filter((link: CommunityLink) => 
            !DEFAULT_LINKS.some(defaultLink => defaultLink.id === link.id)
          )],
          categories: [...new Set([...DEFAULT_CATEGORIES, ...registry.categories])],
          last_updated: registry.last_updated || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error loading community registry:', error);
    }

    // Return defaults
    const defaultRegistry = {
      links: DEFAULT_LINKS,
      categories: DEFAULT_CATEGORIES,
      last_updated: new Date().toISOString()
    };
    
    this.saveRegistry(defaultRegistry);
    return defaultRegistry;
  }

  async saveRegistry(registry: CommunityRegistry): Promise<void> {
    try {
      registry.last_updated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(registry));
    } catch (error) {
      console.error('Error saving community registry:', error);
      throw error;
    }
  }

  async getLinks(): Promise<CommunityLink[]> {
    const registry = await this.getRegistry();
    return registry.links.filter(link => link.active && link.status === 'approved');
  }

  async getRecentLinks(limit: number = 5): Promise<CommunityLink[]> {
    const registry = await this.getRegistry();
    return registry.links
      .filter(link => link.active && link.status === 'approved')
      .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
      .slice(0, limit);
  }

  async getPendingLinks(): Promise<CommunityLink[]> {
    const registry = await this.getRegistry();
    return registry.links.filter(link => link.status === 'pending');
  }

  async submitUserLink(link: Omit<CommunityLink, 'id' | 'created_date' | 'status' | 'active'>): Promise<void> {
    const registry = await this.getRegistry();
    const newLink: CommunityLink = {
      ...link,
      id: Date.now().toString(),
      created_date: new Date().toISOString(),
      status: 'pending',
      active: false
    };
    
    registry.links.push(newLink);
    await this.saveRegistry(registry);
  }

  async getCategories(): Promise<string[]> {
    const registry = await this.getRegistry();
    return registry.categories;
  }

  async addLink(link: Omit<CommunityLink, 'id' | 'created_date'>): Promise<void> {
    const registry = await this.getRegistry();
    const newLink: CommunityLink = {
      ...link,
      id: Date.now().toString(),
      created_date: new Date().toISOString()
    };
    
    registry.links.push(newLink);
    await this.saveRegistry(registry);
  }

  async updateLink(id: string, updates: Partial<CommunityLink>): Promise<void> {
    const registry = await this.getRegistry();
    const linkIndex = registry.links.findIndex(link => link.id === id);
    
    if (linkIndex !== -1) {
      registry.links[linkIndex] = { ...registry.links[linkIndex], ...updates };
      await this.saveRegistry(registry);
    }
  }

  async deleteLink(id: string): Promise<void> {
    const registry = await this.getRegistry();
    registry.links = registry.links.filter(link => link.id !== id);
    await this.saveRegistry(registry);
  }

  async addCategory(categoryName: string): Promise<void> {
    const registry = await this.getRegistry();
    if (!registry.categories.includes(categoryName)) {
      registry.categories.push(categoryName);
      await this.saveRegistry(registry);
    }
  }

  async deleteCategory(categoryName: string): Promise<void> {
    const registry = await this.getRegistry();
    // Don't delete if there are links using this category
    const hasLinks = registry.links.some(link => link.category === categoryName);
    if (!hasLinks) {
      registry.categories = registry.categories.filter(cat => cat !== categoryName);
      await this.saveRegistry(registry);
    } else {
      throw new Error('Cannot delete category that has links assigned to it');
    }
  }
}

export const communityManager = new CommunityManager();