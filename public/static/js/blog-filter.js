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
      
      // Render all posts initially
      renderPosts(allPosts);
      
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
      console.error('Error fetching posts:', error);
      postsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-gray-400">Error loading posts. Please try again later.</p>
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
      card.className = 'post-card bg-gradient-to-br from-gray-900 to-teal-900/10 rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1';
      
      // Format date properly
      const postDate = formatDate(post.date);
      
      // Use the same card design as the templates for consistency
      card.innerHTML = `
        <a href="/blog/posts/${post.slug}.html" class="block h-full flex flex-col">
          <div class="aspect-[16/9] overflow-hidden relative">
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img src="${post.coverImage || '/images/default-cover.jpg'}" alt="${post.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
          </div>
          <div class="p-6 flex-grow flex flex-col">
            <span class="text-sm text-teal-400 mb-1">${post.category || 'Uncategorized'}</span>
            <h3 class="text-xl font-bold mb-3 line-clamp-2">${post.title}</h3>
            <p class="text-gray-300 line-clamp-2 mb-4 flex-grow">${post.excerpt || ''}</p>
            <div class="mt-auto flex items-center text-sm text-gray-400">
              <span>${postDate}</span>
              <span class="mx-2 text-gray-600">•</span>
              <span>${post.author || 'Brainware Team'}</span>
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
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  }
  
  // Handle newsletter subscriptions
  const newsletterForm = document.getElementById('blog-newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('blog-newsletter-email');
      const email = emailInput.value.trim();
      
      if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
      }
      
      // Simple email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
      }
      
      // Here you would typically send the email to your server
      // For now, we'll just show a success message
      showNotification('Thank you for subscribing!', 'success');
      emailInput.value = '';
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
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-y-full ${
      type === 'success' 
        ? 'bg-gradient-to-r from-teal-500 to-teal-400 text-white' 
        : 'bg-gradient-to-r from-red-500 to-red-400 text-white'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">
          ${type === 'success' 
            ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>' 
            : '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>'
          }
        </span>
        <p>${message}</p>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-y-full');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('translate-y-full');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
});
