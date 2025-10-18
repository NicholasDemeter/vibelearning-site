# Admin Dashboard - HTML Tool Management System

A standalone admin dashboard for managing HTML-based tools and content. This system allows you to upload, manage, and preview HTML tools without requiring a complex build process.

## Features

- **Tool Upload & Management**: Upload single HTML files or ZIP packages containing multi-file projects
- **Content Editor**: Edit UI text and copywriting directly through the admin interface
- **Preview System**: Preview tools before publishing
- **Tool Registry**: Automatic registry management with JSON export
- **Responsive Design**: Works on desktop and mobile devices

## File Structure

```
export/
├── admin/
│   ├── index.html          # Main admin dashboard
│   ├── styles.css          # Standalone CSS with design system
│   └── script.js           # Complete JavaScript functionality
├── tools/
│   └── tools-registry.json # Tool registry (auto-updated)
└── README.md               # This file
```

## Getting Started

1. **Setup**: Simply open `admin/index.html` in a web browser
2. **Upload Tools**: Use the "Upload Tools" tab to add HTML files or ZIP packages
3. **Manage Content**: Use the "Edit Text" tab to customize UI text
4. **View Tools**: Use the "Dashboard" tab to manage uploaded tools

## Supported File Types

### Single HTML Files
- File extension: `.html`
- Maximum size: 5MB
- Must contain valid HTML structure

### ZIP Packages
- File extension: `.zip`
- Maximum size: 10MB
- Must contain `index.html` (required)
- Optional files: `styles.css`, `script.js`, `config.json`

## Tool Registry

The system automatically maintains a `tools-registry.json` file in the `/tools/` directory with the following structure:

```json
{
  "tools": [
    {
      "id": "unique-tool-id",
      "name": "Tool Display Name",
      "description": "Tool description",
      "filepath": "/tools/tool-id.html",
      "category": "productivity",
      "active": true,
      "uploaded_date": "2025-01-18T00:00:00.000Z",
      "version": "1.0.0",
      "type": "single"
    }
  ],
  "last_updated": "2025-01-18T00:00:00.000Z"
}
```

## Content Management

The admin dashboard includes a content editor that allows you to modify UI text without editing code:

- Dashboard titles and descriptions
- Upload instructions and help text
- Form labels and placeholders
- Error messages and tooltips

All content changes are stored in localStorage and applied immediately.

## Categories

Available tool categories:
- Productivity
- Education
- Utilities
- Entertainment
- Development
- Design
- Other

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Local Storage

The system uses browser localStorage to store:
- Tool registry and metadata
- Tool content (HTML/files)
- Content editor settings
- User preferences

## Limitations

- No server-side functionality (client-side only)
- Uses localStorage (data is browser-specific)
- No user authentication (placeholder only)
- No build process for complex frameworks

## Future Enhancements

- Server-side integration
- User authentication system
- Advanced build process support
- Database integration
- Multi-user collaboration

## Technical Details

### Design System
The dashboard uses a custom design system based on HSL colors:
- Primary: Chalk yellow (45° 100% 75%)
- Background: Dark chalkboard (168° 45% 12%)
- Secondary: Soft chalk white (0° 0% 85%)

### Dependencies
- JSZip (loaded via CDN for ZIP file processing)
- No build tools required
- Vanilla JavaScript (ES6+)

### File Processing
- HTML validation checks for basic structure
- ZIP extraction with file validation
- Preview generation using iframe sandboxing
- Registry updates with atomic operations

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify file formats and sizes
3. Clear localStorage if experiencing issues
4. Ensure JavaScript is enabled

## License

Open source - free to use and modify.