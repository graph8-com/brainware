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
nunjucks.configure('templates', { autoescape: true });

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
    }));
    
    // Remove any null entries from parsing errors
    const validPosts = posts.filter(post => post !== null);
    
    // Sort posts by date (newest first)
    validPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Extract all unique categories
    const categories = [...new Set(validPosts.map(post => post.category))];
    
    console.log(`📝 Found ${validPosts.length} posts in ${categories.length} categories`);
    
    // Generate individual post pages
    for (const post of validPosts) {
      await generatePostPage(post, validPosts);
    }
    
    // Generate index page
    await generateIndexPage(validPosts, categories);
    
    // Generate category pages
    for (const category of categories) {
      await generateCategoryPage(category, validPosts.filter(post => post.category === category), categories);
    }
    
    // Generate posts.json for client-side filtering
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'posts.json'),
      JSON.stringify({ posts: validPosts.map(simplifyPost) }, null, 2)
    );
    
    console.log('✅ Blog built successfully!');
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
    excerpt: post.excerpt || '',
    coverImage: post.coverImage || '/images/default-cover.jpg',
    category: post.category || 'Uncategorized',
    date: post.date,
    author: post.author || 'Brainware Team'
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
    
    // Render the post HTML
    const html = nunjucks.render('post.html', {
      title: post.title,
      content: htmlContent,
      date: formattedDate,
      author: post.author || 'Brainware Team',
      category: post.category || 'Uncategorized',
      related_posts: relatedPosts
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
    // Get featured post (first post)
    const featuredPost = posts[0];
    const formattedFeaturedDate = format(new Date(featuredPost.date), 'MMMM d, yyyy');
    
    // Create featured post HTML
    const featuredPostHtml = `
      <article class="relative group h-[600px] rounded-2xl overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
        <img src="${featuredPost.coverImage}" alt="${featuredPost.title}" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute bottom-0 left-0 right-0 p-8 z-20">
          <span class="inline-block px-3 py-1 rounded bg-teal-500/20 text-teal-400 text-sm mb-4">${featuredPost.category}</span>
          <h2 class="text-3xl font-bold mb-4">${featuredPost.title}</h2>
          <p class="text-gray-300 mb-4 line-clamp-2">${featuredPost.excerpt || ''}</p>
          <div class="flex items-center">
            <span class="text-sm text-gray-400">${formattedFeaturedDate}</span>
            <span class="mx-2 text-gray-600">•</span>
            <span class="text-sm text-gray-400">${featuredPost.author || 'Brainware Team'}</span>
          </div>
        </div>
        <a href="posts/${featuredPost.slug}.html" class="absolute inset-0 z-30"></a>
      </article>
    `;
    
    // Generate regular post previews (skip the featured one)
    let postPreviewsHtml = '';
    for (let i = 1; i < Math.min(posts.length, POSTS_PER_PAGE); i++) {
      const post = posts[i];
      const formattedDate = format(new Date(post.date), 'MMMM d, yyyy');
      
      postPreviewsHtml += `
        <article class="bg-gradient-to-br from-gray-900 to-teal-900/10 rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300">
          <a href="posts/${post.slug}.html" class="block">
            <div class="aspect-[16/9] overflow-hidden">
              <img src="${post.coverImage || '/images/default-cover.jpg'}" alt="${post.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
            </div>
            <div class="p-6">
              <span class="text-sm text-teal-400">${post.category || 'Uncategorized'}</span>
              <h3 class="text-xl font-bold mt-2 mb-3">${post.title}</h3>
              <p class="text-gray-300 line-clamp-2">${post.excerpt || ''}</p>
              <div class="mt-4 flex items-center">
                <span class="text-sm text-gray-400">${formattedDate}</span>
                <span class="mx-2 text-gray-600">•</span>
                <span class="text-sm text-gray-400">${post.author || 'Brainware Team'}</span>
              </div>
            </div>
          </a>
        </article>
      `;
    }
    
    // Render the index template
    const html = nunjucks.render('index.html', {
      categories: categories,
      featured_post: featuredPostHtml,
      post_previews: postPreviewsHtml
    });
    
    // Write the index file
    const outputPath = path.join(OUTPUT_DIR, 'index.html');
    await fs.writeFile(outputPath, html);
    console.log('📄 Generated index page');
    
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
    // Similar to index page but filtered by category
    // Implementation would be similar to generateIndexPage with category filtering
    
    // For now, a simpler version without featured post
    let postPreviewsHtml = '';
    
    posts.forEach(post => {
      const formattedDate = format(new Date(post.date), 'MMMM d, yyyy');
      
      postPreviewsHtml += `
        <article class="bg-gradient-to-br from-gray-900 to-teal-900/10 rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300">
          <a href="../posts/${post.slug}.html" class="block">
            <div class="aspect-[16/9] overflow-hidden">
              <img src="${post.coverImage || '/images/default-cover.jpg'}" alt="${post.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
            </div>
            <div class="p-6">
              <span class="text-sm text-teal-400">${post.category}</span>
              <h3 class="text-xl font-bold mt-2 mb-3">${post.title}</h3>
              <p class="text-gray-300 line-clamp-2">${post.excerpt || ''}</p>
              <div class="mt-4 flex items-center">
                <span class="text-sm text-gray-400">${formattedDate}</span>
                <span class="mx-2 text-gray-600">•</span>
                <span class="text-sm text-gray-400">${post.author || 'Brainware Team'}</span>
              </div>
            </div>
          </a>
        </article>
      `;
    });
    
    // Render the index template with category-specific content
    const html = nunjucks.render('index.html', {
      title: `${category} | Brainware Opinions`,
      categories: allCategories,
      featured_post: '', // No featured post for category pages
      post_previews: postPreviewsHtml
    });
    
    // Create slug from category
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    
    // Write the category file
    const outputPath = path.join(OUTPUT_DIR, 'categories', `${categorySlug}.html`);
    await fs.writeFile(outputPath, html);
    console.log(`📄 Generated category page: ${category}`);
    
  } catch (error) {
    console.error(`Error generating category page for ${category}:`, error);
  }
}

// Execute the build
buildBlog().catch(err => {
  console.error('❌ Build failed:', err);
});

export { buildBlog };
