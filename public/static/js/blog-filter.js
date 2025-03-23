/**
 * Blog filtering and interaction functionality
 * Implements category filtering with smooth transitions while maintaining
 * Brainware's minimalist aesthetic with teal accents
 */

document.addEventListener('DOMContentLoaded', () => {
  const categoryFilters = document.querySelectorAll('.category-filter');
  const postsContainer = document.getElementById('posts-grid');
  let allPosts = [];
  
  // Fetch the static posts JSON
  fetch('/blog/posts.json')
    .then(response => response.json())
    .then(data => {
      allPosts = data.posts;
      
      // Set up category filter clicks
      categoryFilters.forEach(filter => {
        filter.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Update active state with teal accent styling
          categoryFilters.forEach(f => {
            f.classList.remove('active', 'text-teal-400');
            f.classList.add('text-white');
          });
          filter.classList.add('active', 'text-teal-400');
          filter.classList.remove('text-white');
          
          const selectedCategory = filter.dataset.category;
          
          // Apply smooth fade transition
          postsContainer.classList.add('opacity-0');
          
          setTimeout(() => {
            if (selectedCategory === 'all') {
              renderPosts(allPosts);
            } else {
              const filteredPosts = allPosts.filter(post => 
                post.category === selectedCategory
              );
              renderPosts(filteredPosts);
            }
            
            // Fade back in
            setTimeout(() => {
              postsContainer.classList.remove('opacity-0');
            }, 50);
          }, 300);
        });
      });
    })
    .catch(error => {
      console.error('Error loading posts:', error);
      postsContainer.innerHTML = `
        <div class="col-span-full p-8 text-center">
          <p class="text-red-400">Failed to load posts. Please refresh the page.</p>
        </div>
      `;
    });
  
  /**
   * Renders post cards with consistent design
   * @param {Array} posts - Array of post objects to render
   */
  function renderPosts(posts) {
    // Clear the container
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-gray-400">No posts found in this category</p>
        </div>
      `;
      return;
    }
    
    // Create post cards with Brainware's design language
    posts.forEach(post => {
      const card = document.createElement('article');
      card.className = 'post-card bg-gradient-to-br from-gray-900 to-teal-900/10 rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300';
      
      // Format date properly
      const postDate = formatDate(post.date);
      
      // Use the same card design as the templates for consistency
      card.innerHTML = `
        <a href="/blog/posts/${post.slug}.html" class="block">
          <div class="aspect-[16/9] overflow-hidden">
            <img src="${post.coverImage}" alt="${post.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
          </div>
          <div class="p-6">
            <span class="text-sm text-teal-400">${post.category}</span>
            <h3 class="text-xl font-bold mt-2 mb-3">${post.title}</h3>
            <p class="text-gray-300 line-clamp-2">${post.excerpt}</p>
            <div class="mt-4 flex items-center">
              <span class="text-sm text-gray-400">${postDate}</span>
              <span class="mx-2 text-gray-600">•</span>
              <span class="text-sm text-gray-400">${post.author}</span>
            </div>
          </div>
        </a>
      `;
      
      postsContainer.appendChild(card);
    });
  }
  
  /**
   * Formats date in a human-readable format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Handle newsletter subscriptions
  const newsletterForm = document.getElementById('blog-newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('blog-newsletter-email').value;
      
      if (!email || !email.includes('@')) {
        showNotification('Please enter a valid email address', 'error');
        return;
      }
      
      // Here you would typically send this to your newsletter service
      // For now, just show a success message
      showNotification('Thank you for subscribing!', 'success');
      newsletterForm.reset();
    });
  }
  
  /**
   * Shows a notification with Brainware styling
   * @param {string} message - The message to display
   * @param {string} type - 'success' or 'error'
   */
  function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'notification fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-y-full opacity-0';
    
    if (type === 'success') {
      notification.classList.add('bg-teal-500', 'text-white');
    } else {
      notification.classList.add('bg-red-500', 'text-white');
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-y-full', 'opacity-0');
    }, 10);
    
    // Automatically remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('translate-y-full', 'opacity-0');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
});
