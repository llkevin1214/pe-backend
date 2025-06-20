# EV Charging API Documentation Site

This is the documentation site for ABC Company's EV Charging Solution Public REST API, built with Docusaurus.

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (use `nvm use 22` to switch to the correct version)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in the terminal)

## 📚 Documentation Structure

The documentation is organized as follows:

- **Introduction** (`/docs/intro.md`) - Welcome page and quick start guide
- **Project Overview** (`/docs/project-summary.md`) - Complete project summary and features
- **API Documentation** (`/docs/api-endpoints.md`) - Detailed API reference with examples
- **System Architecture** (`/docs/architecture.md`) - Technical architecture and deployment

## 🛠️ Development

### Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the site for production
- `npm run serve` - Serve the built site locally
- `npm run deploy` - Deploy to GitHub Pages

### Adding New Documentation

1. Create a new Markdown file in the `docs/` directory
2. Add frontmatter with metadata:
   ```markdown
   ---
   sidebar_position: 2
   title: Your Page Title
   ---
   ```
3. Update the sidebar configuration in `sidebars.ts`

### Customization

- **Styling**: Edit `src/css/custom.css` for custom styles
- **Configuration**: Modify `docusaurus.config.ts` for site settings
- **Components**: Add React components in `src/components/`
- **Pages**: Create custom pages in `src/pages/`

## 🎨 Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Search**: Full-text search across all documentation
- **Versioning**: Support for multiple API versions
- **Internationalization**: Ready for multi-language support

## 📖 Content Guidelines

### Writing Documentation

1. **Use clear, concise language**
2. **Include code examples** for all API endpoints
3. **Add proper error handling** examples
4. **Use consistent formatting** and structure
5. **Include practical use cases**

### Code Examples

- Use syntax highlighting for code blocks
- Include both request and response examples
- Show error responses when relevant
- Use realistic data in examples

### Images and Diagrams

- Store images in `static/img/`
- Use SVG format for icons and diagrams
- Optimize images for web use
- Include alt text for accessibility

## 🔧 Configuration

### Site Configuration

The main configuration is in `docusaurus.config.ts`:

- **Site metadata**: Title, description, URL
- **Navigation**: Navbar and footer links
- **Theme**: Colors, fonts, and styling
- **Plugins**: Search, analytics, etc.

### Sidebar Configuration

Edit `sidebars.ts` to organize documentation:

```typescript
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'API Documentation',
      items: ['api-endpoints'],
    },
  ],
};
```

## 🚀 Deployment

### GitHub Pages

1. **Build the site:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   ```bash
   npm run deploy
   ```

### Other Platforms

- **Netlify**: Connect your repository and set build command to `npm run build`
- **Vercel**: Import your repository and configure build settings
- **AWS S3**: Upload the `build/` directory to an S3 bucket

## 📞 Support

- **Documentation Issues**: Create an issue in the repository
- **Feature Requests**: Submit via GitHub issues
- **Questions**: Check the [Docusaurus documentation](https://docusaurus.io/)

## 📄 License

This documentation site is part of the EV Charging API project and follows the same license terms.

---

**Built with [Docusaurus](https://docusaurus.io/)** 