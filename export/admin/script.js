// Admin Dashboard Standalone JavaScript
// HTML Tool Management System

class AdminDashboard {
    constructor() {
        this.currentTab = 'dashboard';
        this.uploadedFile = null;
        this.contentManager = new ContentManager();
        this.toolRegistry = new ToolRegistry();
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadContent();
        this.loadTools();
        
        // Hide loading screen and show app
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
        }, 1000);
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // File upload
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('file-input');

        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', this.handleDragOver.bind(this));
        dropzone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        dropzone.addEventListener('drop', this.handleDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Upload actions
        document.getElementById('preview-btn').addEventListener('click', this.previewTool.bind(this));
        document.getElementById('publish-btn').addEventListener('click', this.publishTool.bind(this));
        document.getElementById('close-preview-btn').addEventListener('click', this.closePreview.bind(this));

        // Content editor
        document.getElementById('content-category-filter').addEventListener('change', this.filterContentItems.bind(this));
        document.getElementById('reset-content-btn').addEventListener('click', this.resetContent.bind(this));

        // Settings
        document.getElementById('view-registry-btn').addEventListener('click', this.viewRegistry.bind(this));
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific content
        if (tabName === 'content') {
            this.loadContentEditor();
        } else if (tabName === 'dashboard') {
            this.loadTools();
        }
    }

    // File Upload Handlers
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dropzone-active');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dropzone-active');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dropzone-active');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    async processFile(file) {
        const isZip = file.name.endsWith('.zip');
        const isHtml = file.name.endsWith('.html');

        if (!isZip && !isHtml) {
            this.showToast('Invalid file type', 'Please upload HTML files (.html) or ZIP files (.zip)', 'error');
            return;
        }

        const sizeLimit = isZip ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > sizeLimit) {
            this.showToast('File too large', `File size must be less than ${isZip ? '10MB' : '5MB'}`, 'error');
            return;
        }

        try {
            if (isZip) {
                await this.processZipFile(file);
            } else {
                await this.processHtmlFile(file);
            }
        } catch (error) {
            this.showToast('Upload failed', error.message, 'error');
        }
    }

    async processHtmlFile(file) {
        const content = await file.text();
        
        if (!content.includes('<html') && !content.includes('<!DOCTYPE')) {
            throw new Error("File doesn't appear to be valid HTML");
        }

        this.uploadedFile = {
            file,
            content,
            type: 'single'
        };

        this.showFileInfo(file);
        this.autoFillMetadata(file.name.replace('.html', ''));
        this.showToast('HTML file uploaded successfully', 'Please fill in the metadata below', 'success');
    }

    async processZipFile(file) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip library not loaded');
        }

        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        
        const files = {};
        const requiredFiles = ['index.html'];
        const optionalFiles = ['styles.css', 'script.js', 'config.json'];
        
        // Check for required files
        for (const fileName of requiredFiles) {
            const zipFile = zipContent.files[fileName];
            if (!zipFile) {
                throw new Error(`Required file missing: ${fileName}`);
            }
            files[fileName] = await zipFile.async('text');
        }
        
        // Process optional files
        for (const fileName of optionalFiles) {
            const zipFile = zipContent.files[fileName];
            if (zipFile) {
                files[fileName] = await zipFile.async('text');
            }
        }

        this.uploadedFile = {
            file,
            files,
            type: 'multi-file'
        };

        this.showFileInfo(file, files);
        this.autoFillMetadata(file.name.replace('.zip', ''));
        this.showToast('ZIP file processed successfully', `Found ${Object.keys(files).length} files. Please fill in the metadata below.`, 'success');
    }

    showFileInfo(file, files = null) {
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');

        fileName.textContent = file.name;
        fileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;

        if (files) {
            fileSize.textContent += ` - Files: ${Object.keys(files).join(', ')}`;
        }

        fileInfo.classList.remove('hidden');
        document.getElementById('metadata-form').classList.remove('hidden');
    }

    autoFillMetadata(filename) {
        const toolName = document.getElementById('tool-name');
        if (!toolName.value) {
            toolName.value = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    }

    previewTool() {
        if (!this.uploadedFile) {
            this.showToast('No file uploaded', 'Please upload a file first', 'error');
            return;
        }

        const previewFrame = document.getElementById('preview-frame');
        const content = this.uploadedFile.type === 'single' 
            ? this.uploadedFile.content 
            : this.uploadedFile.files['index.html'];

        previewFrame.srcdoc = content;
        document.getElementById('preview-modal').classList.remove('hidden');
    }

    closePreview() {
        document.getElementById('preview-modal').classList.add('hidden');
    }

    async publishTool() {
        if (!this.uploadedFile) {
            this.showToast('No file uploaded', 'Please upload a file first', 'error');
            return;
        }

        const toolName = document.getElementById('tool-name').value;
        const toolCategory = document.getElementById('tool-category').value;
        const toolVersion = document.getElementById('tool-version').value;
        const toolDescription = document.getElementById('tool-description').value;

        if (!toolName || !toolCategory) {
            this.showToast('Missing information', 'Please provide tool name and category', 'error');
            return;
        }

        try {
            const toolData = {
                name: toolName,
                description: toolDescription,
                category: toolCategory,
                version: toolVersion,
                type: this.uploadedFile.type
            };

            if (this.uploadedFile.type === 'single') {
                toolData.content = this.uploadedFile.content;
                toolData.filename = this.uploadedFile.file.name;
            } else {
                toolData.files = this.uploadedFile.files;
            }

            const toolId = await this.toolRegistry.addTool(toolData);
            this.showToast('Tool published successfully', `Tool "${toolName}" has been added to the registry`, 'success');
            
            // Reset form
            this.resetUploadForm();
            this.loadTools();
        } catch (error) {
            this.showToast('Publishing failed', 'Failed to publish tool to registry', 'error');
        }
    }

    resetUploadForm() {
        this.uploadedFile = null;
        document.getElementById('file-info').classList.add('hidden');
        document.getElementById('metadata-form').classList.add('hidden');
        document.getElementById('tool-name').value = '';
        document.getElementById('tool-category').value = '';
        document.getElementById('tool-version').value = '1.0.0';
        document.getElementById('tool-description').value = '';
        document.getElementById('file-input').value = '';
    }

    // Content Management
    async loadContent() {
        const content = await this.contentManager.getContent();
        
        // Update UI text content
        content.forEach(item => {
            const element = document.getElementById(this.getElementIdFromKey(item.key));
            if (element) {
                element.textContent = item.value;
            }
        });
    }

    getElementIdFromKey(key) {
        const mapping = {
            'admin.dashboard.title': 'dashboard-title',
            'admin.dashboard.subtitle': 'dashboard-subtitle',
            'admin.upload.title': 'upload-title',
            'admin.upload.description': 'upload-description',
            'admin.upload.dropzone.title': 'dropzone-title',
            'admin.upload.dropzone.subtitle': 'dropzone-subtitle',
            'admin.upload.size.limits': 'size-limits',
            'admin.upload.zip.requirements': 'zip-requirements'
        };
        return mapping[key];
    }

    async loadContentEditor() {
        const content = await this.contentManager.getContent();
        const container = document.getElementById('content-items-list');
        
        container.innerHTML = content.map(item => `
            <div class="content-item">
                <div class="content-item-header">
                    <h4 class="font-medium">${item.label}</h4>
                    <span class="content-item-badge">${item.category}</span>
                </div>
                ${item.description ? `<p class="text-sm text-muted-foreground mb-2">${item.description}</p>` : ''}
                <div class="flex items-center justify-between">
                    <div class="content-item-value">${item.value}</div>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors" onclick="app.editContent('${item.key}')">
                            Edit
                        </button>
                        ${item.category === 'custom' ? `
                            <button class="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/80 transition-colors" onclick="app.deleteContent('${item.key}')">
                                Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterContentItems() {
        // Implementation for filtering content items by category
        this.loadContentEditor();
    }

    async editContent(key) {
        const newValue = prompt('Enter new value:');
        if (newValue !== null) {
            try {
                await this.contentManager.updateContent(key, newValue);
                this.showToast('Content updated', 'Content has been updated successfully', 'success');
                this.loadContent();
                this.loadContentEditor();
            } catch (error) {
                this.showToast('Update failed', 'Could not update content', 'error');
            }
        }
    }

    async deleteContent(key) {
        if (confirm('Are you sure you want to delete this content item?')) {
            try {
                await this.contentManager.deleteContent(key);
                this.showToast('Content deleted', 'Content item has been removed', 'success');
                this.loadContentEditor();
            } catch (error) {
                this.showToast('Delete failed', 'Could not delete content item', 'error');
            }
        }
    }

    async resetContent() {
        if (confirm('Are you sure you want to reset all content to defaults?')) {
            try {
                await this.contentManager.resetToDefaults();
                this.showToast('Content reset', 'All content has been reset to defaults', 'success');
                this.loadContent();
                this.loadContentEditor();
            } catch (error) {
                this.showToast('Reset failed', 'Could not reset content to defaults', 'error');
            }
        }
    }

    // Tool Management
    async loadTools() {
        const tools = await this.toolRegistry.getTools();
        const container = document.getElementById('tools-list');
        
        if (tools.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-muted-foreground">
                    <p>No tools uploaded yet</p>
                    <p class="text-sm mt-1">Upload your first tool using the Upload Tools tab</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tools.map(tool => `
            <div class="border border-border rounded-lg p-4">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h4 class="font-medium">${tool.name}</h4>
                            <span class="content-item-badge">${tool.category}</span>
                            <span class="content-item-badge ${tool.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}">
                                ${tool.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p class="text-sm text-muted-foreground">${tool.description || 'No description'}</p>
                        <p class="text-xs text-muted-foreground mt-1">Version: ${tool.version} | Uploaded: ${new Date(tool.uploaded_date).toLocaleDateString()}</p>
                    </div>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors" onclick="app.toggleToolStatus('${tool.id}')">
                            ${tool.active ? 'Disable' : 'Enable'}
                        </button>
                        <button class="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/80 transition-colors" onclick="app.deleteTool('${tool.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async toggleToolStatus(toolId) {
        try {
            await this.toolRegistry.toggleToolStatus(toolId);
            this.showToast('Tool status updated', 'Tool status has been changed', 'success');
            this.loadTools();
        } catch (error) {
            this.showToast('Update failed', 'Could not update tool status', 'error');
        }
    }

    async deleteTool(toolId) {
        if (confirm('Are you sure you want to delete this tool?')) {
            try {
                await this.toolRegistry.deleteTool(toolId);
                this.showToast('Tool deleted', 'Tool has been removed', 'success');
                this.loadTools();
            } catch (error) {
                this.showToast('Delete failed', 'Could not delete tool', 'error');
            }
        }
    }

    async viewRegistry() {
        const registry = await this.toolRegistry.exportRegistry();
        const blob = new Blob([registry], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tools-registry.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Registry exported', 'Registry has been downloaded as JSON file', 'success');
    }

    // Utility Methods
    showToast(title, description, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-description">${description}</div>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Content Manager Class
class ContentManager {
    constructor() {
        this.storageKey = 'content_registry';
        this.defaultContent = [
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
            }
        ];
    }

    async getContent() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const registry = JSON.parse(stored);
                const existingKeys = new Set(registry.items.map(item => item.key));
                const missingItems = this.defaultContent.filter(item => !existingKeys.has(item.key));
                
                if (missingItems.length > 0) {
                    registry.items.push(...missingItems);
                    await this.saveRegistry(registry);
                }
                
                return registry.items;
            }
            return this.defaultContent;
        } catch (error) {
            console.error('Failed to load content registry:', error);
            return this.defaultContent;
        }
    }

    async saveRegistry(registry) {
        registry.last_updated = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(registry, null, 2));
    }

    async updateContent(key, value) {
        const content = await this.getContent();
        const itemIndex = content.findIndex(item => item.key === key);
        
        if (itemIndex === -1) {
            throw new Error('Content item not found');
        }

        content[itemIndex].value = value;
        await this.saveRegistry({ items: content, last_updated: new Date().toISOString() });
    }

    async deleteContent(key) {
        const content = await this.getContent();
        const filteredContent = content.filter(item => item.key !== key);
        
        if (filteredContent.length === content.length) {
            throw new Error('Content item not found');
        }

        await this.saveRegistry({ items: filteredContent, last_updated: new Date().toISOString() });
    }

    async resetToDefaults() {
        const registry = { items: this.defaultContent, last_updated: new Date().toISOString() };
        await this.saveRegistry(registry);
    }
}

// Tool Registry Class
class ToolRegistry {
    constructor() {
        this.storageKey = 'tool_registry';
    }

    async getTools() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const registry = JSON.parse(stored);
                return registry.tools || [];
            }
            return [];
        } catch (error) {
            console.error('Failed to load tool registry:', error);
            return [];
        }
    }

    async addTool(toolData) {
        const tools = await this.getTools();
        const id = this.generateToolId(toolData.name);
        
        const newTool = {
            id,
            name: toolData.name,
            description: toolData.description,
            filepath: toolData.type === 'multi-file' ? `/tools/${id}/` : `/tools/${id}.html`,
            category: toolData.category,
            active: true,
            uploaded_date: new Date().toISOString(),
            version: toolData.version,
            type: toolData.type,
            files: toolData.files
        };

        // Store tool content
        if (toolData.type === 'single') {
            localStorage.setItem(`tool_content_${id}`, toolData.content);
        } else {
            localStorage.setItem(`tool_files_${id}`, JSON.stringify(toolData.files));
        }

        tools.push(newTool);
        await this.saveRegistry({ tools, last_updated: new Date().toISOString() });
        
        return id;
    }

    async toggleToolStatus(id) {
        const tools = await this.getTools();
        const tool = tools.find(t => t.id === id);
        
        if (!tool) {
            throw new Error('Tool not found');
        }

        tool.active = !tool.active;
        await this.saveRegistry({ tools, last_updated: new Date().toISOString() });
    }

    async deleteTool(id) {
        const tools = await this.getTools();
        const filteredTools = tools.filter(t => t.id !== id);
        
        if (filteredTools.length === tools.length) {
            throw new Error('Tool not found');
        }

        // Remove tool content
        localStorage.removeItem(`tool_content_${id}`);
        localStorage.removeItem(`tool_files_${id}`);
        
        await this.saveRegistry({ tools: filteredTools, last_updated: new Date().toISOString() });
    }

    async saveRegistry(registry) {
        localStorage.setItem(this.storageKey, JSON.stringify(registry, null, 2));
    }

    async exportRegistry() {
        const tools = await this.getTools();
        const registry = { tools, last_updated: new Date().toISOString() };
        return JSON.stringify(registry, null, 2);
    }

    generateToolId(name) {
        const baseId = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        const timestamp = Date.now().toString(36);
        return `${baseId}-${timestamp}`;
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AdminDashboard();
});