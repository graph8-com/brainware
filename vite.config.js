import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: '/public/index.html',
        about: '/public/about.html',
        admin: '/public/admin.html',
        categories: '/public/categories.html',
        companies: '/public/companies.html',
        founders: '/public/founders.html',
        builders: '/public/builders.html',
        opinions: '/public/opinions.html',
        'pe-partners': '/public/pe-partners.html',
        post: '/public/post.html',
        'edit-post': '/public/edit-post.html',
        'view-applications': '/public/view-applications.html'
      }
    }
  },
  esbuild: {
    loader: 'jsx',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: {
    port: 8080
  }
})