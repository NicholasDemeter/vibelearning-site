interface CopyStrings {
  [key: string]: string | CopyStrings;
}

class CopyManager {
  private strings: CopyStrings = {};
  private fallbacks: CopyStrings = {};
  private isLoaded = false;

  async loadStrings(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const response = await fetch('/content/strings.json');
      if (response.ok) {
        const data = await response.json();
        this.strings = data;
      }
    } catch (error) {
      console.warn('Could not load strings.json, using fallbacks:', error);
    }

    // Load any localStorage overrides
    const localOverrides = localStorage.getItem('copyOverrides');
    if (localOverrides) {
      try {
        const overrides = JSON.parse(localOverrides);
        this.strings = { ...this.strings, ...overrides };
      } catch (error) {
        console.warn('Could not parse localStorage overrides:', error);
      }
    }

    this.isLoaded = true;
  }

  getString(key: string, fallback: string = key): string {
    if (!this.isLoaded) {
      return fallback;
    }

    const value = this.getNestedValue(this.strings, key);
    if (typeof value === 'string') {
      return value;
    }
    
    return fallback;
  }

  private getNestedValue(obj: CopyStrings, key: string): string | CopyStrings | undefined {
    const keys = key.split('.');
    let current: any = obj;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  getAllStrings(): CopyStrings {
    return this.strings;
  }

  updateString(key: string, value: string): void {
    // Update in memory
    this.setNestedValue(this.strings, key, value);
    
    // Save to localStorage
    const overrides = JSON.parse(localStorage.getItem('copyOverrides') || '{}');
    this.setNestedValue(overrides, key, value);
    localStorage.setItem('copyOverrides', JSON.stringify(overrides));
  }

  private setNestedValue(obj: CopyStrings, key: string, value: string): void {
    const keys = key.split('.');
    const lastKey = keys.pop()!;
    let current: any = obj;
    
    for (const k of keys) {
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[lastKey] = value;
  }

  exportAllStrings(): string {
    return JSON.stringify(this.strings, null, 2);
  }

  importStrings(jsonString: string): void {
    try {
      const imported = JSON.parse(jsonString);
      this.strings = imported;
      localStorage.setItem('copyOverrides', JSON.stringify(imported));
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  flattenStrings(obj: CopyStrings = this.strings, prefix = ''): Record<string, string> {
    const flattened: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        flattened[fullKey] = value;
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(flattened, this.flattenStrings(value, fullKey));
      }
    }
    
    return flattened;
  }
}

export const copyManager = new CopyManager();