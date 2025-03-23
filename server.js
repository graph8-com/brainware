import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the port to run the server on
const PORT = 8080;

// Define content types for file extensions
const contentTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

// Ensure content directories exist
const CONTENT_DIR = path.join(__dirname, 'content');
const POSTS_DIR = path.join(CONTENT_DIR, 'posts');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const BLOG_IMAGES_DIR = path.join(UPLOADS_DIR, 'blog');
const AUTHORS_IMAGES_DIR = path.join(UPLOADS_DIR, 'authors');
const AUTHORS_DIR = path.join(CONTENT_DIR, 'authors');

// Create necessary directories
fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.mkdirSync(BLOG_IMAGES_DIR, { recursive: true });
fs.mkdirSync(AUTHORS_IMAGES_DIR, { recursive: true });
fs.mkdirSync(AUTHORS_DIR, { recursive: true });

// Function to handle saving a post
function handleSavePost(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const postData = JSON.parse(body);
      
      // Validate post data
      if (!postData.title || !postData.slug || !postData.content) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Missing required fields' }));
        return;
      }
      
      // Ensure slug is URL-friendly
      const slug = postData.slug.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      // Set current date if not provided
      if (!postData.date) {
        postData.date = new Date().toISOString().split('T')[0];
      }
      
      // Write to JSON file in content/posts directory
      const filePath = path.join(POSTS_DIR, `${slug}.json`);
      
      fs.writeFile(filePath, JSON.stringify(postData, null, 2), err => {
        if (err) {
          console.error('Error saving post:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Failed to save post. Please try again.' }));
        } else {
          console.log(`Post saved successfully: ${slug}.json`);
          
          // Automatically rebuild the blog to update posts.json
          console.log('Triggering blog rebuild after post save...');
          import('./build.js')
            .then(buildModule => {
              buildModule.buildBlog()
                .then(() => {
                  console.log('Blog rebuilt successfully after post save');
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Post saved and blog rebuilt successfully!',
                    slug: slug
                  }));
                })
                .catch(error => {
                  console.error('Error rebuilding blog after post save:', error);
                  // Still return success for the post save
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Post saved successfully, but blog rebuild failed. Posts list may not be updated.',
                    slug: slug
                  }));
                });
            })
            .catch(error => {
              console.error('Error importing build module after post save:', error);
              // Still return success for the post save
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: true, 
                message: 'Post saved successfully, but blog rebuild failed. Posts list may not be updated.',
                slug: slug
              }));
            });
        }
      });
    } catch (error) {
      console.error('Error processing post data:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid post data' }));
    }
  });
}

// Function to handle deleting a post
function handleDeletePost(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Missing slug parameter' }));
    return;
  }
  
  const filePath = path.join(POSTS_DIR, `${slug}.json`);
  
  fs.unlink(filePath, err => {
    if (err) {
      console.error(`Error deleting post ${slug}:`, err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Failed to delete post. Please try again.' }));
    } else {
      console.log(`Post deleted successfully: ${slug}.json`);
      
      // Automatically rebuild the blog to update posts.json
      console.log('Triggering blog rebuild after post deletion...');
      import('./build.js')
        .then(buildModule => {
          buildModule.buildBlog()
            .then(() => {
              console.log('Blog rebuilt successfully after post deletion');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: true, 
                message: 'Post deleted and blog rebuilt successfully!' 
              }));
            })
            .catch(error => {
              console.error('Error rebuilding blog after post deletion:', error);
              // Still return success for the post deletion
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: true, 
                message: 'Post deleted successfully, but blog rebuild failed. Posts list may not be updated.' 
              }));
            });
        })
        .catch(error => {
          console.error('Error importing build module after post deletion:', error);
          // Still return success for the post deletion
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Post deleted successfully, but blog rebuild failed. Posts list may not be updated.' 
          }));
        });
    }
  });
}

// Function to handle building the blog
function handleBuildBlog(req, res) {
  console.log('Building blog...');
  // Import the build module dynamically
  import('./build.js')
    .then(buildModule => {
      buildModule.buildBlog()
        .then(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Blog built successfully!' }));
        })
        .catch(error => {
          console.error('Error building blog:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Failed to build blog. Please try again.' }));
        });
    })
    .catch(error => {
      console.error('Error importing build module:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Failed to load build module. Please try again.' }));
    });
}

// Function to handle getting categories
function handleGetCategories(req, res) {
  const categoriesPath = path.join(CONTENT_DIR, 'settings', 'categories.json');
  
  // Check if the file exists
  fs.access(categoriesPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Categories file not found');
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Categories not found' }));
      return;
    }
    
    // Read the file
    fs.readFile(categoriesPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading categories:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to read categories data' }));
        return;
      }
      
      try {
        // Parse and return the categories data
        const categoriesData = JSON.parse(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(categoriesData));
      } catch (error) {
        console.error('Error parsing categories data:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid categories data format' }));
      }
    });
  });
}

// Function to handle updating categories
function handleUpdateCategories(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      // Validate categories data
      if (!data.categories || !Array.isArray(data.categories)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid categories data' }));
        return;
      }
      
      // Validate each category has required fields
      for (const category of data.categories) {
        if (!category.id || !category.name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Each category must have id and name' }));
          return;
        }
      }
      
      const categoriesPath = path.join(CONTENT_DIR, 'settings', 'categories.json');
      
      // Write the updated categories to file
      fs.writeFile(categoriesPath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error saving categories:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Failed to save categories' }));
          return;
        }
        
        console.log('Categories updated successfully');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Categories updated successfully' }));
        
        // Trigger blog rebuild to apply category changes
        exec('node build.js', (error, stdout, stderr) => {
          if (error) {
            console.error(`Error rebuilding blog: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`Rebuild stderr: ${stderr}`);
            return;
          }
          console.log(`Blog rebuilt after category update: ${stdout}`);
        });
      });
    } catch (error) {
      console.error('Error parsing request body:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid JSON format' }));
    }
  });
}

// Function to handle getting authors
function handleGetAuthors(req, res) {
  const authorsPath = path.join(AUTHORS_DIR, 'authors.json');
  
  // Check if the file exists
  fs.access(authorsPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Authors file not found');
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Authors not found' }));
      return;
    }
    
    // Read the file
    fs.readFile(authorsPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading authors:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to read authors data' }));
        return;
      }
      
      try {
        // Parse and return the authors data
        const authorsData = JSON.parse(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(authorsData));
      } catch (error) {
        console.error('Error parsing authors data:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid authors data format' }));
      }
    });
  });
}

// Function to handle updating authors
function handleUpdateAuthors(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      // Validate authors data
      if (!data.authors || !Array.isArray(data.authors)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid authors data' }));
        return;
      }
      
      // Validate each author has required fields
      for (const author of data.authors) {
        if (!author.slug || !author.name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Each author must have slug and name' }));
          return;
        }
      }
      
      const authorsPath = path.join(AUTHORS_DIR, 'authors.json');
      
      // Write the updated authors to file
      fs.writeFile(authorsPath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error saving authors:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Failed to save authors' }));
          return;
        }
        
        console.log('Authors updated successfully');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Authors updated successfully' }));
        
        // Trigger blog rebuild to apply author changes
        exec('node build.js', (error, stdout, stderr) => {
          if (error) {
            console.error(`Error rebuilding blog: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`Rebuild stderr: ${stderr}`);
            return;
          }
          console.log(`Blog rebuilt after author update: ${stdout}`);
        });
      });
    } catch (error) {
      console.error('Error parsing request body:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid JSON format' }));
    }
  });
}

// Function to handle image uploads
function handleImageUpload(req, res) {
  // Define boundary from content-type header
  const contentType = req.headers['content-type'];
  
  // Check if it's multipart/form-data
  if (!contentType || !contentType.includes('multipart/form-data')) {
    console.error('Invalid content type:', contentType);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: false, 
      message: 'Invalid content type, multipart/form-data required' 
    }));
    return;
  }
  
  const boundary = contentType.split('; boundary=')[1];
  if (!boundary) {
    console.error('No boundary found in content-type:', contentType);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: false, 
      message: 'Invalid content type, boundary not found' 
    }));
    return;
  }

  let body = [];
  let fileName = '';
  
  req.on('data', chunk => {
    body.push(chunk);
  });
  
  req.on('end', () => {
    try {
      console.log('Image upload request received, processing...');
      const buffer = Buffer.concat(body);
      
      // Convert buffer to string
      const bodyStr = buffer.toString();
      
      // Find the filename from the form data
      const fileNameMatch = bodyStr.match(/filename="(.+?)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
        console.log(`Detected filename: ${fileName}`);
      } else {
        console.error('No filename found in form data');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'No file detected' }));
        return;
      }
      
      // Generate unique filename to prevent overwrites
      const fileExt = path.extname(fileName);
      const uniqueFileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}${fileExt}`;
      const filePath = path.join(BLOG_IMAGES_DIR, uniqueFileName);
      
      console.log(`Saving image as: ${uniqueFileName}`);
      
      // Parse out the actual file content from the multipart data
      const dataStartIndex = bodyStr.indexOf('\r\n\r\n') + 4;
      const dataEndIndex = bodyStr.lastIndexOf(`--${boundary}--`) - 2;
      
      if (dataStartIndex > 0 && dataEndIndex > 0) {
        const fileData = buffer.slice(dataStartIndex, dataEndIndex);
        
        // Ensure the uploads directory exists
        fs.mkdirSync(BLOG_IMAGES_DIR, { recursive: true });
        
        // Write the file
        fs.writeFileSync(filePath, fileData);
        console.log(`Image saved to ${filePath}`);
        
        // Send success response with file URL
        const fileUrl = `/uploads/blog/${uniqueFileName}`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'File uploaded successfully',
          url: fileUrl,
          fileName: uniqueFileName
        }));
      } else {
        console.error('Could not parse file data from request');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Could not parse file data' }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error uploading image: ' + error.message }));
    }
  });
}

// Function to handle author image uploads
function handleAuthorImageUpload(req, res) {
  // Define boundary from content-type header
  const contentType = req.headers['content-type'];
  
  // Check if it's multipart/form-data
  if (!contentType || !contentType.includes('multipart/form-data')) {
    console.error('Invalid content type:', contentType);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: false, 
      message: 'Invalid content type, multipart/form-data required' 
    }));
    return;
  }
  
  const boundary = contentType.split('; boundary=')[1];
  if (!boundary) {
    console.error('No boundary found in content-type:', contentType);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: false, 
      message: 'Invalid content type, boundary not found' 
    }));
    return;
  }

  let body = [];
  let fileName = '';
  
  req.on('data', chunk => {
    body.push(chunk);
  });
  
  req.on('end', () => {
    try {
      console.log('Author image upload request received, processing...');
      const buffer = Buffer.concat(body);
      
      // Convert buffer to string
      const bodyStr = buffer.toString();
      
      // Find the filename from the form data
      const fileNameMatch = bodyStr.match(/filename="(.+?)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
        console.log(`Detected filename: ${fileName}`);
      } else {
        console.error('No filename found in form data');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'No file detected' }));
        return;
      }
      
      // Generate unique filename to prevent overwrites
      const fileExt = path.extname(fileName);
      const uniqueFileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}${fileExt}`;
      const filePath = path.join(AUTHORS_IMAGES_DIR, uniqueFileName);
      
      console.log(`Saving author image as: ${uniqueFileName}`);
      
      // Parse out the actual file content from the multipart data
      const dataStartIndex = bodyStr.indexOf('\r\n\r\n') + 4;
      const dataEndIndex = bodyStr.lastIndexOf(`--${boundary}--`) - 2;
      
      if (dataStartIndex > 0 && dataEndIndex > 0) {
        const fileData = buffer.slice(dataStartIndex, dataEndIndex);
        
        // Ensure the authors directory exists
        fs.mkdirSync(AUTHORS_IMAGES_DIR, { recursive: true });
        
        // Write the file
        fs.writeFileSync(filePath, fileData);
        console.log(`Author image saved to ${filePath}`);
        
        // Send success response with file URL
        const fileUrl = `/uploads/authors/${uniqueFileName}`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Author image uploaded successfully',
          url: fileUrl,
          fileName: uniqueFileName
        }));
      } else {
        console.error('Could not parse file data from request');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Could not parse file data' }));
      }
    } catch (error) {
      console.error('Error uploading author image:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error uploading author image: ' + error.message }));
    }
  });
}

// Function to handle login
function handleLogin(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      // Validate login data
      if (!data.authorSlug || !data.password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Author slug and password are required' }));
        return;
      }
      
      const authorsPath = path.join(AUTHORS_DIR, 'authors.json');
      
      // Check if the authors file exists
      fs.access(authorsPath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error('Authors file not found');
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Authors not found' }));
          return;
        }
        
        // Read the authors file
        fs.readFile(authorsPath, 'utf8', (err, fileData) => {
          if (err) {
            console.error('Error reading authors:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to read authors data' }));
            return;
          }
          
          try {
            const authorsData = JSON.parse(fileData);
            
            // Find the author with the matching slug
            const author = authorsData.authors.find(a => a.slug === data.authorSlug);
            
            if (!author) {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'Author not found' }));
              return;
            }
            
            // Check if the password matches
            if (author.password !== data.password) {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'Invalid password' }));
              return;
            }
            
            // Generate a simple token (in a real app, use a proper JWT)
            const token = Buffer.from(`${author.slug}:${Date.now()}`).toString('base64');
            
            // Return success with token
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Login successful',
              token,
              author: {
                slug: author.slug,
                name: author.name
              }
            }));
            
          } catch (error) {
            console.error('Error parsing authors data:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Invalid authors data format' }));
          }
        });
      });
      
    } catch (error) {
      console.error('Error parsing request body:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid JSON format' }));
    }
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Parse the URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Blog API endpoints
  if (req.method === 'POST' && (url.pathname === '/api/posts' || url.pathname === '/api/save-post')) {
    handleSavePost(req, res);
    return;
  }
  
  if (req.method === 'DELETE' && url.pathname === '/api/delete-post') {
    handleDeletePost(req, res);
    return;
  }
  
  if (req.method === 'POST' && url.pathname === '/api/upload-image') {
    handleImageUpload(req, res);
    return;
  }
  
  if (req.method === 'POST' && url.pathname === '/api/build') {
    handleBuildBlog(req, res);
    return;
  }
  
  if (req.method === 'GET' && url.pathname === '/api/categories') {
    handleGetCategories(req, res);
    return;
  }
  
  if (req.method === 'POST' && url.pathname === '/api/categories') {
    handleUpdateCategories(req, res);
    return;
  }
  
  if (req.method === 'GET' && url.pathname === '/api/authors') {
    const authorsPath = path.join(AUTHORS_DIR, 'authors.json');
    fs.access(authorsPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('Authors file not found');
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Authors not found' }));
        return;
      }
      fs.readFile(authorsPath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading authors:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Failed to read authors data' }));
          return;
        }
        try {
          const authorsData = JSON.parse(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(authorsData));
        } catch (error) {
          console.error('Error parsing authors data:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Invalid authors data format' }));
        }
      });
    });
    return;
  }
  
  if (req.method === 'POST' && url.pathname === '/api/authors') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.authors || !Array.isArray(data.authors)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Invalid authors data' }));
          return;
        }
        for (const author of data.authors) {
          if (!author.slug || !author.name) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Each author must have slug and name' }));
            return;
          }
        }
        const authorsPath = path.join(AUTHORS_DIR, 'authors.json');
        fs.writeFile(authorsPath, JSON.stringify(data, null, 2), 'utf8', (err) => {
          if (err) {
            console.error('Error saving authors:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to save authors' }));
            return;
          }
          console.log('Authors updated successfully');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Authors updated successfully' }));
          exec('node build.js', (error, stdout, stderr) => {
            if (error) {
              console.error(`Error rebuilding blog: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`Rebuild stderr: ${stderr}`);
              return;
            }
            console.log(`Blog rebuilt after author update: ${stdout}`);
          });
        });
      } catch (error) {
        console.error('Error parsing request body:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON format' }));
      }
    });
    return;
  }
  
  if (req.method === 'POST' && url.pathname === '/api/upload-author-image') {
    handleAuthorImageUpload(req, res);
    return;
  }
  
  if (req.method === 'POST' && url.pathname === '/api/login') {
    handleLogin(req, res);
    return;
  }
  
  // Handle GET requests for a specific post by slug
  if (req.method === 'GET' && url.pathname.startsWith('/api/posts/')) {
    // Extract the slug from the URL (remove '/api/posts/' and '.json' if present)
    const slug = url.pathname.replace(/^\/api\/posts\//, '').replace(/\.json$/, '');
    
    if (slug) {
      const filePath = path.join(POSTS_DIR, `${slug}.json`);
      
      // Check if the file exists
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          // File doesn't exist
          console.error(`Post not found: ${slug}`);
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Post not found' }));
          return;
        }
        
        // Read the file
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading post ${slug}:`, err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to read post data' }));
            return;
          }
          
          try {
            // Parse and return the post data
            const postData = JSON.parse(data);
            console.log(`Serving post data for ${slug}, content length: ${postData.content?.length || 0}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(postData));
          } catch (error) {
            console.error(`Error parsing post data for ${slug}:`, error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Invalid post data format' }));
          }
        });
      });
      return;
    }
  }
  
  // Save application form data
  if (req.method === 'POST' && url.pathname === '/save_application') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const formData = new URLSearchParams(body);
        const name = formData.get('name');
        const email = formData.get('email');
        const country = formData.get('country');
        const note = formData.get('note');
        
        // Validate form data
        if (!name || !email || !country) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Missing required fields' }));
          return;
        }
        
        // Format the data
        const timestamp = new Date().toISOString();
        const dataToAppend = `Timestamp: ${timestamp}\nName: ${name}\nEmail: ${email}\nCountry: ${country}\nNote: ${note}\n------------------------------------------------------\n\n`;
        
        // Append to applications.txt
        fs.appendFile(path.join(__dirname, 'applications.txt'), dataToAppend, (err) => {
          if (err) {
            console.error('Error saving application:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to save application. Please try again.' }));
          } else {
            console.log('Application saved successfully');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Application submitted successfully!' }));
          }
        });
      } catch (error) {
        console.error('Error processing application data:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid form data' }));
      }
    });
    
    return;
  }
  
  // Serve static files
  let filePath = '';
  
  if (url.pathname === '/' || url.pathname === '/index.html') {
    filePath = path.join(__dirname, 'public', 'index.html');
  } else {
    // Remove leading slash and normalize path
    // Check first in public directory, then in root if not found
    filePath = path.join(__dirname, 'public', path.normalize(url.pathname.substring(1)));
  }
  
  // Get the file extension
  const extname = path.extname(filePath);
  const contentType = contentTypes[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page not found
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
