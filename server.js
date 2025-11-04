const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Use in-memory database (persists while server runs)
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('✅ Connected to in-memory SQLite database');
        initializeDatabase();
    }
});

// Initialize database with sample data
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
        date_added DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT NOT NULL,
        email TEXT NOT NULL,
        text TEXT NOT NULL,
        status TEXT DEFAULT 'approved',
        documentary_id INTEGER,
        date_added DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )`);

    // Create default admin user
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    bcrypt.hash(defaultPassword, 10, (err, hash) => {
        if (!err) {
            db.run(`INSERT OR IGNORE INTO admin_users (username, password_hash) VALUES (?, ?)`, 
                ['admin', hash], () => {
                    console.log('✅ Admin user created: admin /', defaultPassword);
                });
        }
    });

    // Sample documentaries data
    const sampleDocumentaries = [
        {
            title: "Wilderness Untamed",
            description: "Explore the last remaining wilderness areas on Earth and the challenges they face in the modern world.",
            category: "nature",
            image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            rating: 4.5,
            downloads: 1247,
            duration: "45 min"
        },
        {
            title: "Urban Echoes",
            description: "A deep dive into the lives of city dwellers and how urbanization is reshaping human connections.",
            category: "society", 
            image_url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            rating: 4.2,
            downloads: 892,
            duration: "52 min"
        },
        {
            title: "Mountain Voices",
            description: "Follow the lives of communities living in the world's highest mountain ranges and their unique cultures.",
            category: "culture",
            image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            rating: 4.8,
            downloads: 1563,
            duration: "38 min"
        }
    ];

    // Clear and insert sample documentaries
    db.run(`DELETE FROM documentaries`, () => {
        sampleDocumentaries.forEach(doc => {
            db.run(`INSERT INTO documentaries (title, description, category, image_url, rating, downloads, duration) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [doc.title, doc.description, doc.category, doc.image_url, doc.rating, doc.downloads, doc.duration]);
        });
        console.log('✅ Sample documentaries loaded');
    });

    // Sample comments
    const sampleComments = [
        {
            author: "Sarah Johnson",
            email: "sarah@example.com",
            text: "Wilderness Untamed completely changed my perspective on conservation. The cinematography was breathtaking!",
            documentary_id: 1
        },
        {
            author: "Michael Torres", 
            email: "michael@example.com",
            text: "As an urban planner, Urban Echoes resonated deeply with me. Beautifully captures modern city life challenges.",
            documentary_id: 2
        }
    ];

    db.run(`DELETE FROM comments`, () => {
        sampleComments.forEach(comment => {
            db.run(`INSERT INTO comments (author, email, text, documentary_id) VALUES (?, ?, ?, ?)`,
                [comment.author, comment.email, comment.text, comment.documentary_id]);
        });
        console.log('✅ Sample comments loaded');
    });
}

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === 'Bearer admin-token') {
        next();
    } else {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// ===== API ROUTES =====

// Get all documentaries
app.get('/api/documentaries', (req, res) => {
    db.all(`SELECT * FROM documentaries ORDER BY date_added DESC`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new documentary (URL-based)
app.post('/api/documentaries', authenticateAdmin, (req, res) => {
    const { title, description, category, duration, image_url, video_url } = req.body;
    
    if (!title || !description || !category || !image_url) {
        return res.status(400).json({ error: 'Title, description, category, and image URL are required' });
    }

    db.run(
        `INSERT INTO documentaries (title, description, category, duration, image_url, video_url) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description, category, duration, image_url, video_url || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                id: this.lastID,
                title,
                description,
                category,
                image_url,
                video_url: video_url || null,
                duration,
                message: 'Documentary added successfully'
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
    
    db.get(`SELECT * FROM admin_users WHERE username = ?`, [username], (err, row) => {
        if (err || !row) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        bcrypt.compare(password, row.password_hash, (err, result) => {
            if (result) {
                const token = 'admin-token';
                res.json({
                    token,
                    user: { username: row.username },
                    message: 'Login successful'
                });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
    });
});

// Get comments
app.get('/api/comments', (req, res) => {
    db.all(`SELECT * FROM comments WHERE status = 'approved' ORDER BY date_added DESC`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add comment
app.post('/api/comments', (req, res) => {
    const { author, email, text, documentary_id } = req.body;
    
    if (!author || !email || !text) {
        return res.status(400).json({ error: 'Author, email, and text are required' });
    }

    db.run(`INSERT INTO comments (author, email, text, documentary_id) VALUES (?, ?, ?, ?)`,
        [author, email, text, documentary_id || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                id: this.lastID,
                message: 'Comment added successfully'
            });
        }
    );
});

// Track download
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

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Database: In-memory SQLite (data persists while server runs)`);
});
// Add these routes to your existing server.js:

// User registration
app.post('/api/user/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // In a real app, you'd hash the password and save to database
    // For demo, we'll just return success
    res.json({
        token: 'demo-user-token',
        user: { name, email },
        message: 'Registration successful'
    });
});

// User login
app.post('/api/user/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Demo credentials
    if (email === 'user@example.com' && password === 'password123') {
        res.json({
            token: 'demo-user-token',
            user: { name: 'Demo User', email },
            message: 'Login successful'
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});
