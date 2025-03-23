# Brainware

A modern website for Brainware - empowering founders to create wealth and sustainable jobs in the 4th Industrial Revolution.

## Features

- Responsive design using Tailwind CSS
- Clean, modern UI with gradient accents
- Interactive navigation
- Network background in hero sections
- Sections for Home, About, Companies, and Opinions
- Static blog system with minimal design and efficient content delivery

## Technologies Used

- HTML5
- CSS3 with Tailwind CSS
- JavaScript
- SVG graphics
- Node.js for blog generation
- TipTap for rich text editing
- Express.js for API endpoints

## Pages

- Home page with hero section and features
- About page with team information
- Companies page
- Job application pages with role-specific tracking
- Static blog with category filtering and search

## Blog System

The website includes a static blog system that generates HTML from JSON content:

### Blog Features

- Static HTML generation for optimal performance
- Category-based filtering
- Clean, minimalist design with Brainware's aesthetic
- Rich text editor for content creation
- Admin interface for managing posts
- Responsive layouts for all devices

### Blog Management

1. Access the admin panel at `/admin/index.html`
2. Create and edit posts through the admin interface
3. Posts are stored as JSON files in `content/posts/`
4. Build the static site with the "Build Site" button or run `npm run blog:build`

### Blog Development

```bash
# Install dependencies
npm install

# Start the server
npm start

# Build the blog (generate static HTML)
npm run blog:build

# Development mode with auto-rebuild on file changes
npm run blog:dev
```

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Visit `http://localhost:8080` in your browser

## Development

```bash
# Start the development server
npm start

# Build the blog
npm run blog:build

# Watch for content changes and auto-rebuild
npm run blog:dev
```
