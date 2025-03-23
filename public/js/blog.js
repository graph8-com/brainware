/**
 * Brainware Blog Frontend Script
 * Handles post loading, filtering, and transitions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const categoryFilters = document.querySelectorAll('.category-filter');
  const searchInput = document.getElementById('search-input');
  const postsContainer = document.getElementById('posts-container');
  const featuredPost = document.querySelector('.featured-post');
  const noResultsMessage = document.getElementById('no-results');
  
  // State
  let allPosts = [];
  let filteredPosts = [];
  let currentCategory = 'all';
  let currentSearch = '';
  
  // Fetch all posts data
  async function fetchPosts() {
    try {
      const response = await fetch('/blog/posts.json');
      const data = await response.json();
      
      if (data && data.posts) {
        allPosts = data.posts;
        filteredPosts = [...allPosts];
        renderPosts(filteredPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }
  
  // Format date for display
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  // Render posts to the container
  function renderPosts(posts) {
    if (!postsContainer) return;
    
    if (posts.length === 0) {
      postsContainer.innerHTML = '';
      if (noResultsMessage) {
        noResultsMessage.classList.remove('hidden');
      }
      return;
    }
    
    if (noResultsMessage) {
      noResultsMessage.classList.add('hidden');
    }
    
    let html = '';
    
    posts.forEach(post => {
      html += `
        <article class="bg-gradient-to-br from-gray-900 to-teal-900/10 rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300 opacity-0 transform translate-y-4" data-post>
          <a href="/blog/posts/${post.slug}.html" class="block">
            <div class="aspect-[16/9] overflow-hidden">
              <img src="${post.coverImage || '/images/blog/default-cover.jpg'}" alt="${post.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
            </div>
            <div class="p-6">
              <span class="text-sm text-teal-400">${post.category || 'Uncategorized'}</span>
              <h3 class="text-xl font-bold mt-2 mb-3">${post.title}</h3>
              <p class="text-gray-300 line-clamp-2">${post.excerpt || ''}</p>
              <div class="mt-4 flex items-center">
                <span class="text-sm text-gray-400">${formatDate(post.date)}</span>
                <span class="mx-2 text-gray-600">•</span>
                <span class="text-sm text-gray-400">${post.author || 'Brainware Team'}</span>
              </div>
            </div>
          </a>
        </article>
      `;
    });
    
    postsContainer.innerHTML = html;
    
    // Animate posts in
    setTimeout(() => {
      const postElements = document.querySelectorAll('[data-post]');
      postElements.forEach((post, index) => {
        setTimeout(() => {
          post.classList.remove('opacity-0', 'translate-y-4');
        }, index * 100);
      });
    }, 100);
  }
  
  // Filter posts by category
  function filterByCategory(category) {
    currentCategory = category;
    applyFilters();
    
    // Update active category filter
    categoryFilters.forEach(filter => {
      if (filter.dataset.category === category) {
        filter.classList.add('active', 'text-teal-400', 'border-teal-400');
        filter.classList.remove('text-gray-400', 'border-transparent');
      } else {
        filter.classList.remove('active', 'text-teal-400', 'border-teal-400');
        filter.classList.add('text-gray-400', 'border-transparent');
      }
    });
    
    // Hide featured post when filtering
    if (featuredPost && category !== 'all') {
      featuredPost.classList.add('hidden');
    } else if (featuredPost) {
      featuredPost.classList.remove('hidden');
    }
  }
  
  // Filter posts by search
  function filterBySearch(search) {
    currentSearch = search.toLowerCase();
    applyFilters();
  }
  
  // Apply all current filters
  function applyFilters() {
    let results = [...allPosts];
    
    // Apply category filter
    if (currentCategory !== 'all') {
      results = results.filter(post => post.category === currentCategory);
    }
    
    // Apply search filter
    if (currentSearch) {
      results = results.filter(post => {
        return post.title.toLowerCase().includes(currentSearch) || 
               post.excerpt.toLowerCase().includes(currentSearch) ||
               post.content?.toLowerCase().includes(currentSearch);
      });
    }
    
    filteredPosts = results;
    renderPosts(filteredPosts);
  }
  
  // Initialize event listeners
  function initEventListeners() {
    // Category filters
    categoryFilters.forEach(filter => {
      filter.addEventListener('click', () => {
        const category = filter.dataset.category;
        filterByCategory(category);
      });
    });
    
    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filterBySearch(e.target.value);
      });
    }
  }
  
  // Initialize
  fetchPosts();
  initEventListeners();
});
