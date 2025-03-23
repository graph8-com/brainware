import fs from 'fs-extra';
import path from 'path';
import { marked } from 'marked';
import { format } from 'date-fns';
import nunjucks from 'nunjucks';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Nunjucks
nunjucks.configure('templates', { 
  autoescape: true,
  watch: false, // Set to true during development for auto-reloading
  noCache: true // Disable caching to ensure templates are always re-read
});

// Configuration
const CONTENT_DIR = path.join(__dirname, 'content');
const OUTPUT_DIR = path.join(__dirname, 'public', 'blog');
const POSTS_DIR = path.join(CONTENT_DIR, 'posts');
const POSTS_PER_PAGE = 9;
const RELATED_POSTS_COUNT = 3;

/**
 * Main build function
 * Generates all blog pages from content files
 */
async function buildBlog() {
  console.log('🚀 Building Brainware static blog...');
  
  // Ensure output directories exist
  fs.ensureDirSync(path.join(OUTPUT_DIR, 'posts'));
  fs.ensureDirSync(path.join(OUTPUT_DIR, 'categories'));
  
  try {
    // Read all post files
    const postFiles = fs.readdirSync(POSTS_DIR)
      .filter(file => file.endsWith('.json'));
      
    if (postFiles.length === 0) {
      console.log('⚠️ No posts found in content directory');
      return;
    }
      
    // Parse posts
    const posts = await Promise.all(postFiles.map(async file => {
      const filePath = path.join(POSTS_DIR, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      try {
        return JSON.parse(fileContent);
      } catch (err) {
        console.error(`Error parsing ${file}:`, err);
        return null;
      }
    })).then(results => results.filter(Boolean));
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get all unique categories
    const categories = [...new Set(posts.map(post => post.category || 'Uncategorized'))];
    
    // Generate individual post pages
    for (const post of posts) {
      await generatePostPage(post, posts);
    }
    
    // Generate index page
    await generateIndexPage(posts, categories);
    
    // Generate category pages
    for (const category of categories) {
      const categoryPosts = posts.filter(post => 
        (post.category || 'Uncategorized') === category
      );
      await generateCategoryPage(category, categoryPosts, categories);
    }
    
    // Copy assets
    console.log('📁 Copying assets...');
    
    console.log('✅ Blog build completed successfully!');
    
  } catch (error) {
    console.error('❌ Error building blog:', error);
  }
}

/**
 * Simplifies post data for JSON export
 * @param {Object} post - Full post object
 * @returns {Object} - Simplified post
 */
function simplifyPost(post) {
  return {
    title: post.title,
    slug: post.slug,
    date: post.date,
    excerpt: post.excerpt,
    category: post.category || 'Uncategorized',
    author: post.author || 'Brainware Team',
    coverImage: post.coverImage || post.cover_image
  };
}

/**
 * Generates individual post HTML page
 * @param {Object} post - Post data
 * @param {Array} allPosts - All posts for related posts
 */
async function generatePostPage(post, allPosts) {
  try {
    // Convert markdown content to HTML
    const htmlContent = marked.parse(post.content || '');
    
    // Get related posts (same category, excluding current)
    let relatedPosts = allPosts
      .filter(p => p.slug !== post.slug && p.category === post.category)
      .slice(0, RELATED_POSTS_COUNT);
      
    // If we don't have enough related posts, add some from other categories
    if (relatedPosts.length < RELATED_POSTS_COUNT) {
      const moreRelated = allPosts
        .filter(p => p.slug !== post.slug && p.category !== post.category)
        .slice(0, RELATED_POSTS_COUNT - relatedPosts.length);
        
      relatedPosts = [...relatedPosts, ...moreRelated];
    }
    
    // Format dates for display
    const formattedDate = format(new Date(post.date), 'MMMM d, yyyy');
    relatedPosts = relatedPosts.map(p => ({
      ...p,
      date: format(new Date(p.date), 'MMMM d, yyyy')
    }));
    
    // Get author image if available
    let authorImage = null;
    try {
      const authorsFilePath = path.join(CONTENT_DIR, 'authors', 'authors.json');
      if (fs.existsSync(authorsFilePath)) {
        const authorsData = JSON.parse(fs.readFileSync(authorsFilePath, 'utf-8'));
        const authorData = authorsData.authors.find(a => 
          a.name.toLowerCase() === post.author?.toLowerCase() || 
          a.slug === post.author?.toLowerCase().replace(/\s+/g, '-')
        );
        if (authorData && authorData.image) {
          authorImage = authorData.image;
        }
      }
    } catch (err) {
      console.error('Error getting author image:', err);
    }
    
    // Render the post HTML
    const html = nunjucks.render('post.html', {
      title: post.title,
      content: htmlContent,
      date: formattedDate,
      author: post.author || 'Brainware Team',
      author_image: authorImage,
      category: post.category || 'Uncategorized',
      related_posts: relatedPosts,
      coverImage: post.coverImage, // Pass the cover image path
      post: post, // Pass the full post object for additional data
      footer: nunjucks.render('footer.html'), // Include the footer template
      metaTags: {
        title: post.title,
        description: post.excerpt,
        url: `https://brainware.io/blog/posts/${post.slug}.html`,
        image: post.coverImage ? `https://brainware.io${post.coverImage}` : null
      }
    });
    
    // Write the file
    const outputPath = path.join(OUTPUT_DIR, 'posts', `${post.slug}.html`);
    await fs.writeFile(outputPath, html);
    console.log(`📄 Generated post: ${post.slug}.html`);
    
  } catch (error) {
    console.error(`Error generating post ${post.slug}:`, error);
  }
}

/**
 * Generates the blog index page
 * @param {Array} posts - All post data
 * @param {Array} categories - List of categories
 */
async function generateIndexPage(posts, categories) {
  try {
    // Format dates for display
    const formattedPosts = posts.map(post => ({
      ...post,
      date: format(new Date(post.date), 'MMMM d, yyyy')
    }));
    
    // Get featured post (most recent)
    const featuredPost = formattedPosts[0];
    
    // Get recent posts (excluding featured)
    const recentPosts = formattedPosts.slice(1, POSTS_PER_PAGE);
    
    // Generate post previews HTML
    const postPreviewsHtml = recentPosts.map(post => 
      nunjucks.render('post-preview.html', { post })
    ).join('');
    
    // Render the index HTML
    const html = nunjucks.render('index.html', {
      title: 'Opinions | Brainware',
      featured_post: nunjucks.render('featured-post.html', { post: featuredPost }),
      post_previews: postPreviewsHtml,
      categories: categories,
      all_posts: formattedPosts,
      footer: nunjucks.render('footer.html') // Include the footer template
    });
    
    // Write the file
    const outputPath = path.join(OUTPUT_DIR, 'index.html');
    await fs.writeFile(outputPath, html);
    console.log('📄 Generated index page');
    
    // Create JSON file with all posts for client-side filtering
    const postsJson = JSON.stringify({ posts: formattedPosts.map(simplifyPost) });
    const jsonPath = path.join(OUTPUT_DIR, 'posts.json');
    await fs.writeFile(jsonPath, postsJson);
    console.log('📄 Generated posts.json');
    
  } catch (error) {
    console.error('Error generating index page:', error);
  }
}

/**
 * Generates category pages
 * @param {string} category - Category name
 * @param {Array} posts - Posts in this category
 * @param {Array} allCategories - All categories for navigation
 */
async function generateCategoryPage(category, posts, allCategories) {
  try {
    // Format dates for display
    const formattedPosts = posts.map(post => ({
      ...post,
      date: format(new Date(post.date), 'MMMM d, yyyy')
    }));
    
    // Create category slug
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    
    // Render the category HTML
    const html = nunjucks.render('category.html', {
      title: `${category} | Brainware Opinions`,
      category: category,
      posts: formattedPosts,
      categories: allCategories,
      footer: nunjucks.render('footer.html') // Include the footer template
    });
    
    // Write the file
    const outputPath = path.join(OUTPUT_DIR, 'categories', `${categorySlug}.html`);
    await fs.writeFile(outputPath, html);
    console.log(`📄 Generated category page: ${category}`);
    
  } catch (error) {
    console.error(`Error generating category page ${category}:`, error);
  }
}

// Copy necessary assets to ensure the blog works properly
async function copyAssets() {
  // Make sure the JS directory exists
  fs.ensureDirSync(path.join(OUTPUT_DIR, 'js'));
  
  // Copy newsletter.js to ensure subscription form works
  try {
    await fs.copy(
      path.join(__dirname, 'public', 'js', 'newsletter.js'),
      path.join(OUTPUT_DIR, 'js', 'newsletter.js')
    );
    console.log('📄 Copied newsletter.js');
  } catch (error) {
    console.error('Error copying newsletter.js:', error);
  }
  
  // Copy menu.js for navigation
  try {
    await fs.copy(
      path.join(__dirname, 'public', 'js', 'menu.js'),
      path.join(OUTPUT_DIR, 'js', 'menu.js')
    );
    console.log('📄 Copied menu.js');
  } catch (error) {
    console.error('Error copying menu.js:', error);
  }
}

// Export the build function
export { buildBlog };

// Add the copyAssets function to the buildBlog function
buildBlog().then(() => {
  copyAssets();
});
