const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all in production
    : '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '.')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup for Render
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/documentaries.db' 
  : './documentaries.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS documentaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    video_url TEXT,
    rating REAL DEFAULT 4.0,
    downloads INTEGER DEFAULT 0,
    duration TEXT,
    date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER,
    file_type TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    email TEXT NOT NULL,
    text TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    documentary_id INTEGER,
    date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documentary_id) REFERENCES documentaries (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default admin user
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
  bcrypt.hash(defaultPassword, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return;
    }
    
    db.run(`INSERT OR IGNORE INTO admin_users (username, password_hash) VALUES (?, ?)`, 
      ['admin', hash], 
      function(err) {
        if (err) {
          console.error('Error creating admin user:', err);
        } else {
          console.log('Default admin user created: admin /', defaultPassword);
        }
      }
    );
  });

  // Insert sample data
  setTimeout(() => {
    db.get(`SELECT COUNT(*) as count FROM documentaries`, (err, row) => {
      if (err) return;
      
      if (row.count === 0) {
        const sampleData = [
          {
            title: "Wilderness Untamed",
            description: "Explore the last remaining wilderness areas on Earth and the challenges they face in the modern world.",
            category: "nature",
            image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
            rating: 4.5,
            downloads: 1247,
            duration: "45 min"
          },
          {
            title: "Urban Echoes", 
            description: "A deep dive into the lives of city dwellers and how urbanization is reshaping human connections.",
            category: "society",
            image_url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1129&q=80",
            rating: 4.2,
            downloads: 892,
            duration: "52 min"
          },
          {
            title: "Mountain Voices",
            description: "Follow the lives of communities living in the world's highest mountain ranges and their unique cultures.",
            category: "culture",
            image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            rating: 4.8,
            downloads: 1563,
            duration: "38 min"
          }
        ];

        sampleData.forEach(doc => {
          db.run(`INSERT INTO documentaries (title, description, category, image_url, rating, downloads, duration) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [doc.title, doc.description, doc.category, doc.image_url, doc.rating, doc.downloads, doc.duration]);
        });
        console.log('Sample data inserted');
      }
    });
  }, 1000);
}

// File upload configuration
const ensureUploadsDir = () => {
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory:', uploadDir);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadsDir();
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/avi': 'avi',
    'video/mkv': 'mkv'
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images and videos are allowed.`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024
  },
  fileFilter: fileFilter
});

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (token === 'Bearer admin-token') {
    next();
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all documentaries
app.get('/api/documentaries', (req, res) => {
  db.all(`SELECT * FROM documentaries ORDER BY date_added DESC`, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Failed to fetch documentaries' });
      return;
    }
    res.json(rows || []);
  });
});

// Upload new documentary
app.post('/api/documentaries', authenticateAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), (req, res) => {
  const { title, description, category, duration } = req.body;
  
  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, description, and category are required' });
  }

  const imageFile = req.files['image'] ? req.files['image'][0] : null;

  if (!imageFile) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  const imageUrl = `/uploads/${imageFile.filename}`;
  const videoUrl = req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

  db.run(
    `INSERT INTO documentaries (title, description, category, image_url, video_url, duration) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, category, imageUrl, videoUrl, duration],
    function(err) {
      if (err) {
        console.error('Insert error:', err);
        res.status(500).json({ error: 'Failed to create documentary' });
        return;
      }
      
      res.json({
        id: this.lastID,
        title,
        description,
        category,
        image_url: imageUrl,
        video_url: videoUrl,
        duration,
        message: 'Documentary uploaded successfully'
      });
    }
  );
});

// Delete documentary
app.delete('/api/documentaries/:id', authenticateAdmin, (req, res) => {
  const id = req.params.id;
  
  db.run(`DELETE FROM documentaries WHERE id = ?`, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ message: 'Documentary deleted successfully' });
  });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get(`SELECT * FROM admin_users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, row.password_hash, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (result) {
        const token = 'admin-token';
        res.json({
          token,
          user: {
            id: row.id,
            username: row.username
          },
          message: 'Login successful'
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  });
});

// Get all comments
app.get('/api/comments', (req, res) => {
  const status = req.query.status || 'approved';
  
  db.all(`SELECT * FROM comments WHERE status = ? ORDER BY date_added DESC`, [status], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// Add new comment
app.post('/api/comments', (req, res) => {
  const { author, email, text, documentary_id } = req.body;
  
  if (!author || !email || !text) {
    return res.status(400).json({ error: 'Author, email, and text are required' });
  }

  db.run(
    `INSERT INTO comments (author, email, text, documentary_id) VALUES (?, ?, ?, ?)`,
    [author, email, text, documentary_id || null],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        id: this.lastID,
        author,
        email,
        text,
        documentary_id: documentary_id || null,
        status: 'pending',
        date_added: new Date().toISOString(),
        message: 'Comment submitted for review'
      });
    }
  );
});

// Download tracking
app.post('/api/documentaries/:id/download', (req, res) => {
  const id = req.params.id;
  
  db.run(`UPDATE documentaries SET downloads = downloads + 1 WHERE id = ?`, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ message: 'Download tracked successfully' });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }
  }
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : error.message 
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});