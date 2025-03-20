import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        about: '/about.html',
        admin: '/admin.html',
        categories: '/categories.html',
        companies: '/companies.html',
        opinions: '/opinions.html',
        post: '/post.html',
        'edit-post': '/edit-post.html'
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