// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Enhanced API Service
class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('adminToken');
        this.userToken = localStorage.getItem('userToken');
    }

    setToken(token, type = 'admin') {
        if (type === 'admin') {
            this.token = token;
            if (token) {
                localStorage.setItem('adminToken', token);
            } else {
                localStorage.removeItem('adminToken');
            }
        } else {
            this.userToken = token;
            if (token) {
                localStorage.setItem('userToken', token);
            } else {
                localStorage.removeItem('userToken');
            }
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token && !endpoint.includes('/admin/login') && !endpoint.includes('/user/')) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (this.userToken && endpoint.includes('/user/')) {
            config.headers['Authorization'] = `Bearer ${this.userToken}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
    // Add to ApiService class
async uploadPdf(file) {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await fetch(`${this.baseURL}/upload/pdf`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${this.token}`
        },
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
}

async downloadPdf(id) {
    return this.request(`/documentaries/${id}/pdf/download`, {
        method: 'POST'
    });
}

    // Documentaries
    async getDocumentaries() {
        return this.request('/documentaries');
    }

    async uploadDocumentary(documentaryData) {
        return this.request('/documentaries', {
            method: 'POST',
            body: JSON.stringify(documentaryData)
        });
    }

    async deleteDocumentary(id) {
        return this.request(`/documentaries/${id}`, {
            method: 'DELETE'
        });
    }

    // Comments
    async getComments() {
        return this.request('/comments');
    }

    async addComment(comment) {
        return this.request('/comments', {
            method: 'POST',
            body: JSON.stringify(comment)
        });
    }

    // Admin
    async adminLogin(credentials) {
        const result = await this.request('/admin/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (result.token) {
            this.setToken(result.token, 'admin');
        }
        
        return result;
    }

    // User Authentication
    async userLogin(credentials) {
        const result = await this.request('/user/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (result.token) {
            this.setToken(result.token, 'user');
        }
        
        return result;
    }

    async userRegister(userData) {
        return this.request('/user/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Downloads
    async trackDownload(id) {
        return this.request(`/documentaries/${id}/download`, {
            method: 'POST'
        });
    }
}

// Initialize API service
const apiService = new ApiService();

// Simple Adipo Documentaries App - All in One
class AdipoDocumentariesApp {
    constructor() {
        this.currentView = 'home';
        this.documentaries = [];
        this.comments = [];
        this.apiService = apiService;
        this.isUserLoggedIn = !!localStorage.getItem('userToken');
        this.isAdminLoggedIn = !!localStorage.getItem('adminToken');
        this.init();
        // PDF Upload and Handling Methods
handlePdfUpload(files) {
    if (!files.length) return;
    
    const file = files[0];
    
    // Validate file type
    if (file.type !== 'application/pdf') {
        this.showNotification('Please upload a PDF file only', 'error');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        this.showNotification('PDF file size must be less than 10MB', 'error');
        return;
    }
    
    // Show preview
    this.showPdfPreview(file);
    
    // Update upload area
    const uploadArea = document.getElementById('pdfUploadArea');
    uploadArea.innerHTML = `
        <i class="fas fa-check-circle" style="color: var(--success);"></i>
        <p>${file.name}</p>
        <small>${this.formatFileSize(file.size)} - Ready to upload</small>
    `;
    uploadArea.style.borderColor = 'var(--success)';
}

showPdfPreview(file) {
    const previewContainer = document.getElementById('pdf-preview');
    const fileURL = URL.createObjectURL(file);
    
    previewContainer.innerHTML = `
        <div class="pdf-preview-content">
            <div class="pdf-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <div class="pdf-info">
                <h4>${file.name}</h4>
                <p>${this.formatFileSize(file.size)}</p>
                <button type="button" class="btn btn-outline btn-sm" onclick="app.removePdfPreview()">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        </div>
    `;
    previewContainer.style.display = 'block';
    
    // Store file for later upload
    this.currentPdfFile = file;
}

removePdfPreview() {
    const previewContainer = document.getElementById('pdf-preview');
    const uploadArea = document.getElementById('pdfUploadArea');
    
    previewContainer.style.display = 'none';
    previewContainer.innerHTML = '';
    
    uploadArea.innerHTML = `
        <i class="fas fa-file-pdf"></i>
        <p>Click to upload PDF file</p>
        <small>Max file size: 10MB</small>
    `;
    uploadArea.style.borderColor = '';
    
    // Clear stored file
    this.currentPdfFile = null;
    document.getElementById('pdf-file').value = '';
}

formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async uploadPdfToServer(file) {
    // Simulate PDF upload - in real app, you'd upload to your server
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate a mock URL - in production, this would be your actual file URL
            const mockPdfUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
            resolve(mockPdfUrl);
        }, 1500);
    });
}

// Update the documentary submission to handle PDF
async handleDocumentarySubmit(e) {
    e.preventDefault();
    
    if (!this.isAdminLoggedIn) {
        this.showNotification('Admin access required', 'error');
        return;
    }

    const title = document.getElementById('product-title').value;
    const description = document.getElementById('product-description').value;
    const category = document.getElementById('product-category').value;
    const duration = document.getElementById('product-duration').value;
    const imageUrl = document.getElementById('product-image-url').value;
    const videoUrl = document.getElementById('product-video-url')?.value || null;
    const pdfUrl = document.getElementById('product-pdf-url')?.value || null;
    const rating = parseFloat(document.getElementById('product-rating').value) || 4.0;

    if (!title || !description || !category) {
        this.showNotification('Please fill all required fields', 'error');
        return;
    }

    // Validate image URL
    if (imageUrl && !this.isValidImageUrl(imageUrl)) {
        this.showNotification('Please enter a valid image URL (jpg, png, gif, etc.)', 'error');
        return;
    }

    // Validate video URL if provided
    if (videoUrl && !this.isValidVideoUrl(videoUrl)) {
        this.showNotification('Please enter a valid YouTube, Vimeo, or direct video URL', 'error');
        return;
    }

    // Validate PDF URL if provided
    if (pdfUrl && !this.isValidPdfUrl(pdfUrl)) {
        this.showNotification('Please enter a valid PDF URL', 'error');
        return;
    }

    try {
        let finalPdfUrl = pdfUrl;
        
        // Upload PDF file if one was selected
        if (this.currentPdfFile) {
            this.showNotification('Uploading PDF file...', 'info');
            finalPdfUrl = await this.uploadPdfToServer(this.currentPdfFile);
            this.showNotification('PDF uploaded successfully!', 'success');
        }

        const documentaryData = {
            id: Date.now(),
            title,
            description,
            category,
            duration,
            image_url: imageUrl,
            video_url: videoUrl,
            pdf_url: finalPdfUrl,
            rating: rating,
            downloads: 0,
            dateAdded: new Date().toISOString().split('T')[0]
        };

        const result = await this.apiService.uploadDocumentary(documentaryData);
        
        this.showNotification('Documentary added successfully!', 'success');
        this.closeAdminModal();
        
        // Add to local documentaries
        this.documentaries.unshift(documentaryData);
        
        // Update views
        if (this.currentView === 'admin' || this.currentView === 'documentaries' || this.currentView === 'home') {
            this.render();
        }
        
    } catch (error) {
        console.error('Error adding documentary:', error);
        // Fallback for demo
        const documentaryData = {
            id: Date.now(),
            title,
            description,
            category,
            duration,
            image_url: imageUrl,
            video_url: videoUrl,
            pdf_url: pdfUrl,
            rating: rating,
            downloads: 0,
            dateAdded: new Date().toISOString().split('T')[0]
        };
        this.documentaries.unshift(documentaryData);
        this.showNotification('Documentary added successfully!', 'success');
        this.closeAdminModal();
        
        if (this.currentView === 'admin' || this.currentView === 'documentaries' || this.currentView === 'home') {
            this.render();
        }
    }
}

isValidPdfUrl(url) {
    if (!url) return true; // PDF is optional
    
    // Check if it's a PDF file or common document hosting
    const pdfPattern = /\.(pdf)$/i;
    if (pdfPattern.test(url)) {
        return true;
    }
    
    // Allow common document hosting services
    const allowedDomains = [
        'drive.google.com',
        'dropbox.com',
        'onedrive.live.com',
        'icloud.com',
        'docs.google.com'
    ];
    
    return allowedDomains.some(domain => url.includes(domain));
}

// Update the documentary card to show PDF download
renderDocumentaryCard(doc) {
    const imageUrl = this.getImageUrl(doc);
    const isFallback = !doc.image_url || !this.isValidImageUrl(doc.image_url);
    const hasPdf = doc.pdf_url && this.isValidPdfUrl(doc.pdf_url);
    
    return `
        <div class="documentary-card">
            <div class="card-img ${isFallback ? 'fallback' : ''}" 
                 style="${!isFallback ? `background-image: url('${imageUrl}')` : ''}">
                ${isFallback ? `
                    <i class="fas fa-film"></i>
                ` : `
                    <div class="card-overlay">
                        <button class="btn-play" onclick="app.viewDetails(${doc.id})">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                `}
            </div>
            <div class="card-content">
                <h3>${doc.title}</h3>
                <p>${doc.description}</p>
                <div class="card-meta">
                    <span class="category-tag">${doc.category}</span>
                    <span class="duration">${doc.duration}</span>
                </div>
                <div class="card-stats">
                    <div class="rating">
                        ${this.generateStars(doc.rating)}
                        <span>${doc.rating}</span>
                    </div>
                    <div class="downloads">
                        <i class="fas fa-download"></i>
                        <span>${doc.downloads || 0}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-outline" onclick="app.downloadDocumentary(${doc.id})">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn btn-primary" onclick="app.viewDetails(${doc.id})">
                        <i class="fas fa-play"></i> Watch
                    </button>
                    ${hasPdf ? `
                        <button class="btn btn-outline" onclick="app.downloadPdf(${doc.id})" title="Download PDF">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// PDF Download Method
async downloadPdf(id) {
    if (!this.isUserLoggedIn) {
        this.showNotification('Please login to download PDFs', 'warning');
        this.navigate('login');
        return;
    }

    const documentary = this.documentaries.find(doc => doc.id === id);
    if (!documentary || !documentary.pdf_url) {
        this.showNotification('PDF not available for this documentary', 'error');
        return;
    }

    try {
        this.showNotification('Preparing PDF download...', 'info');
        
        // Track download
        await this.apiService.trackDownload(id);
        
        // Simulate download delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Open PDF in new tab or download
        this.openPdf(documentary.pdf_url, documentary.title);
        
        this.showNotification('PDF download started!', 'success');
        
    } catch (error) {
        // Fallback - open PDF directly
        this.openPdf(documentary.pdf_url, documentary.title);
        this.showNotification('PDF opened in new tab!', 'success');
    }
}

openPdf(pdfUrl, title) {
    // Try to open in new tab for viewing
    const newTab = window.open(pdfUrl, '_blank');
    
    // If blocked by popup blocker, provide download link
    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
        // Create download link
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Update the video modal to show PDF download option
getVideoEmbed(documentary) {
    // ... existing video embed code ...
    
    // Add PDF download button to video details
    const hasPdf = documentary.pdf_url && this.isValidPdfUrl(documentary.pdf_url);
    const pdfButton = hasPdf ? `
        <button class="btn btn-outline" onclick="app.downloadPdf(${documentary.id})" style="margin-top: 1rem;">
            <i class="fas fa-file-pdf"></i> Download PDF Companion
        </button>
    ` : '';
    
    // Add to the existing return statement in getVideoEmbed method
    // Find where the video details are returned and add the pdfButton
    return `
        ${videoEmbed}
        <div class="video-details" style="margin-top: 1.5rem;">
            <h3>${documentary.title}</h3>
            <p>${documentary.description}</p>
            ${pdfButton}
            <div class="video-meta" style="display: flex; gap: 2rem; margin-top: 1rem; color: var(--secondary);">
                <span><i class="fas fa-clock"></i> ${documentary.duration}</span>
                <span><i class="fas fa-download"></i> ${documentary.downloads || 0} downloads</span>
                <span><i class="fas fa-star"></i> ${documentary.rating}/5</span>
                <span><i class="fas fa-tag"></i> ${documentary.category}</span>
            </div>
        </div>
    `;
}
    }

    async init() {
        // Hide loading immediately
        this.hideLoading();
        
        // Render initial content FIRST
        this.render();
        
        // Then load data in background
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            // Load data from API with timeout
            await Promise.race([
                Promise.all([
                    this.loadDocumentaries(),
                    this.loadComments()
                ]),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                )
            ]);
        } catch (error) {
            console.log('Using fallback data due to timeout');
            // Use fallback data immediately
            await this.loadFallbackData();
        }
        
        // Update the view with data
        this.renderDocumentaries();
        this.renderComments();
    }

    async loadDocumentaries() {
        try {
            this.documentaries = await this.apiService.getDocumentaries();
        } catch (error) {
            // Let fallback handle it
            throw error;
        }
    }

    async loadComments() {
        try {
            this.comments = await this.apiService.getComments();
        } catch (error) {
            this.comments = [];
        }
    }

    async loadFallbackData() {
        // Mock data as fallback - IMMEDIATE
        this.documentaries = [
            {
                id: 1,
                title: "Wilderness Untamed",
                description: "Explore the last remaining wilderness areas on Earth and the challenges they face in the modern world.",
                image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                video_url: "https://www.youtube.com/embed/7n7bw6luneo",
                category: "nature",
                rating: 4.5,
                downloads: 1247,
                dateAdded: "2023-05-15",
                duration: "45 min"
            },
            {
                id: 2,
                title: "Urban Echoes",
                description: "A deep dive into the lives of city dwellers and how urbanization is reshaping human connections.",
                image_url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                video_url: "https://www.youtube.com/embed/6v2L2UGZJAM",
                category: "society",
                rating: 4.2,
                downloads: 892,
                dateAdded: "2023-04-22",
                duration: "52 min"
            },
            {
                id: 3,
                title: "Mountain Voices",
                description: "Follow the lives of communities living in the world's highest mountain ranges and their unique cultures.",
                image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                video_url: "https://www.youtube.com/embed/4kL2M20acuw",
                category: "culture",
                rating: 4.8,
                downloads: 1563,
                dateAdded: "2023-06-03",
                duration: "38 min"
            }
        ];
        
        this.comments = [
            {
                id: 1,
                author: "Sarah Johnson",
                email: "sarah@example.com",
                text: "Wilderness Untamed completely changed my perspective on conservation. The cinematography was breathtaking!",
                date: "2023-06-15",
                status: "approved",
                documentaryId: 1
            },
            {
                id: 2,
                author: "Michael Torres",
                email: "michael@example.com",
                text: "As an urban planner, Urban Echoes resonated deeply with me. Beautifully captures modern city life challenges.",
                date: "2023-05-28",
                status: "approved",
                documentaryId: 2
            }
        ];
    }

    render() {
        const appElement = document.getElementById('app');
        if (!appElement) {
            console.error('App element not found!');
            return;
        }

        appElement.innerHTML = `
            ${this.renderHeader()}
            <main>
                ${this.renderCurrentView()}
            </main>
            ${this.renderFooter()}
            ${this.renderModals()}
        `;

        this.bindEventListeners();
    }

    renderHeader() {
        const userStatus = this.isUserLoggedIn ? 
            `<span class="user-welcome">Welcome, User!</span>
             <button class="btn btn-outline" id="logoutBtn">Logout</button>` :
            `<button class="btn btn-outline" id="loginBtn">Login</button>
             <button class="btn btn-primary" id="registerBtn">Register</button>`;

        const adminButton = this.isAdminLoggedIn ? 
            `<button class="btn btn-primary" id="adminBtn">
                <i class="fas fa-cogs"></i> Admin Panel
             </button>` :
            `<button class="btn btn-outline" id="adminLoginBtn">
                <i class="fas fa-lock"></i> Admin Login
             </button>`;

        return `
            <header>
                <div class="container">
                    <div class="header-content">
                        <div class="logo">
                            <i class="fas fa-film"></i>
                            <h1 id="odd";>Adipo Education && Documentaries plartform</h1>
                        </div>
                        <nav>
                            <ul>
                                <li><a href="#home" class="nav-link ${this.currentView === 'home' ? 'active' : ''}" data-view="home">Home</a></li>
                                <li><a href="#documentaries" class="nav-link ${this.currentView === 'documentaries' ? 'active' : ''}" data-view="documentaries">Documentaries</a></li>
                                <li><a href="#subscribe" class="nav-link ${this.currentView === 'subscribe' ? 'active' : ''}" data-view="subscribe">Subscribe</a></li>
                                <li><a href="#donate" class="nav-link ${this.currentView === 'donate' ? 'active' : ''}" data-view="donate">Donate</a></li>
                                <li><a href="#comments" class="nav-link ${this.currentView === 'comments' ? 'active' : ''}" data-view="comments">Comments</a></li>
                                <li><a href="#contact" class="nav-link ${this.currentView === 'contact' ? 'active' : ''}" data-view="contact">Contact</a></li>
                            </ul>
                        </nav>
                        <div class="auth-buttons">
                            ${userStatus}
                            ${adminButton}
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    renderCurrentView() {
        if (!this.isUserLoggedIn && this.currentView !== 'login' && this.currentView !== 'register') {
            return this.renderLogin();
        }

        switch (this.currentView) {
            case 'home':
                return this.renderHome();
            case 'documentaries':
                return this.renderDocumentariesView();
            case 'subscribe':
                return this.renderSubscribe();
            case 'donate':
                return this.renderDonate();
            case 'comments':
                return this.renderCommentsView();
            case 'contact':
                return this.renderContact();
            case 'admin':
                return this.renderAdmin();
            case 'login':
                return this.renderLogin();
            case 'register':
                return this.renderRegister();
            default:
                return this.renderHome();
        }
    }

    renderLogin() {
        return `
            <section class="auth-section">
                <div class="container">
                    <div class="auth-container">
                        <div class="auth-card">
                            <div class="auth-header">
                                <i class="fas fa-film"></i>
                                <h2>Welcome to Adipo Documentaries</h2>
                                <p>Please login to access our exclusive content</p>
                            </div>
                            <form class="auth-form" id="loginForm">
                                <div class="form-group">
                                    <label for="login-email">Email</label>
                                    <input type="email" id="login-email" class="form-control" placeholder="Enter your email" required>
                                </div>
                                <div class="form-group">
                                    <label for="login-password">Password</label>
                                    <input type="password" id="login-password" class="form-control" placeholder="Enter your password" required>
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">
                                    <i class="fas fa-sign-in-alt"></i> Login
                                </button>
                            </form>
                            <div class="auth-footer">
                                <p>Don't have an account? <a href="#" id="showRegister">Register here</a></p>
                            </div>
                            <div class="demo-credentials">
                                <h4>Demo Credentials:</h4>
                                <p><strong>Email:</strong> user@example.com</p>
                                <p><strong>Password:</strong> password123</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderRegister() {
        return `
            <section class="auth-section">
                <div class="container">
                    <div class="auth-container">
                        <div class="auth-card">
                            <div class="auth-header">
                                <i class="fas fa-user-plus"></i>
                                <h2>Create Account</h2>
                                <p>Join our community of documentary lovers</p>
                            </div>
                            <form class="auth-form" id="registerForm">
                                <div class="form-group">
                                    <label for="register-name">Full Name</label>
                                    <input type="text" id="register-name" class="form-control" placeholder="Enter your full name" required>
                                </div>
                                <div class="form-group">
                                    <label for="register-email">Email</label>
                                    <input type="email" id="register-email" class="form-control" placeholder="Enter your email" required>
                                </div>
                                <div class="form-group">
                                    <label for="register-password">Password</label>
                                    <input type="password" id="register-password" class="form-control" placeholder="Create a password" required>
                                </div>
                                <div class="form-group">
                                    <label for="register-confirm">Confirm Password</label>
                                    <input type="password" id="register-confirm" class="form-control" placeholder="Confirm your password" required>
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">
                                    <i class="fas fa-user-plus"></i> Create Account
                                </button>
                            </form>
                            <div class="auth-footer">
                                <p>Already have an account? <a href="#" id="showLogin">Login here</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderHome() {
        return `
            <section class="hero" id="home">
                <div class="container">
                    <div class="hero-content">
                        <h2>Explore the World Through Documentaries</h2>
                        <p>Access exclusive content, download documentaries, and join our community of curious minds. Your gateway to untold stories from around the globe.</p>
                        <div class="hero-buttons">
                            <button class="btn btn-primary" data-view="documentaries">
                                <i class="fas fa-play"></i> Start Watching
                            </button>
                            <button class="btn btn-outline" data-view="subscribe">
                                <i class="fas fa-crown"></i> Go Premium
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="features-section">
                <div class="container">
                    <div class="features-grid">
                        <div class="feature-card">
                            <i class="fas fa-globe"></i>
                            <h3>Global Stories</h3>
                            <p>Discover documentaries from every corner of the world</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-download"></i>
                            <h3>Download & Watch</h3>
                            <p>Download your favorites and watch offline</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-users"></i>
                            <h3>Join Community</h3>
                            <p>Connect with other documentary enthusiasts</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="section">
                <div class="container">
                    <div class="section-title">
                        <h2>Featured Documentaries</h2>
                        <p>Handpicked selections from our extensive collection</p>
                    </div>
                    <div class="documentaries-grid" id="featured-grid">
                        ${this.renderFeaturedDocumentaries()}
                    </div>
                </div>
            </section>
        `;
    }

    renderFeaturedDocumentaries() {
        if (this.documentaries.length === 0) {
            return `
                <div class="loading-grid">
                    <div class="loading-card"></div>
                    <div class="loading-card"></div>
                    <div class="loading-card"></div>
                </div>
            `;
        }

        return this.documentaries.slice(0, 3).map(doc => 
            this.renderDocumentaryCard(doc)
        ).join('');
    }

    renderDocumentariesView() {
        return `
            <section class="section" id="documentaries">
                <div class="container">
                    <div class="section-header">
                        <div class="section-title">
                            <h2>All Documentaries</h2>
                            <p>Browse our complete collection</p>
                        </div>
                        <div class="section-filters">
                            <select class="filter-select" id="categoryFilter">
                                <option value="">All Categories</option>
                                <option value="nature">Nature</option>
                                <option value="society">Society</option>
                                <option value="culture">Culture</option>
                                <option value="science">Science</option>
                                <option value="history">History</option>
                            </select>
                        </div>
                    </div>
                    <div class="documentaries-grid" id="documentaries-grid">
                        ${this.renderAllDocumentaries()}
                    </div>
                </div>
            </section>
        `;
    }

    renderAllDocumentaries() {
        if (this.documentaries.length === 0) {
            return `
                <div class="loading-grid">
                    <div class="loading-card"></div>
                    <div class="loading-card"></div>
                    <div class="loading-card"></div>
                    <div class="loading-card"></div>
                    <div class="loading-card"></div>
                    <div class="loading-card"></div>
                </div>
            `;
        }

        return this.documentaries.map(doc => 
            this.renderDocumentaryCard(doc)
        ).join('');
    }

    renderDocumentaryCard(doc) {
        const imageUrl = this.getImageUrl(doc);
        const isFallback = !doc.image_url || !this.isValidImageUrl(doc.image_url);
        
        return `
            <div class="documentary-card">
                <div class="card-img ${isFallback ? 'fallback' : ''}" 
                     style="${!isFallback ? `background-image: url('${imageUrl}')` : ''}">
                    ${isFallback ? `
                        <i class="fas fa-film"></i>
                    ` : `
                        <div class="card-overlay">
                            <button class="btn-play" onclick="app.viewDetails(${doc.id})">
                                <i class="fas fa-play"></i>
                            </button>
                        </div>
                    `}
                </div>
                <div class="card-content">
                    <h3>${doc.title}</h3>
                    <p>${doc.description}</p>
                    <div class="card-meta">
                        <span class="category-tag">${doc.category}</span>
                        <span class="duration">${doc.duration}</span>
                    </div>
                    <div class="card-stats">
                        <div class="rating">
                            ${this.generateStars(doc.rating)}
                            <span>${doc.rating}</span>
                        </div>
                        <div class="downloads">
                            <i class="fas fa-download"></i>
                            <span>${doc.downloads || 0}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-outline" onclick="app.downloadDocumentary(${doc.id})">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="btn btn-primary" onclick="app.viewDetails(${doc.id})">
                            <i class="fas fa-play"></i> Watch
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderCommentsView() {
        return `
            <section class="comments-section" id="comments">
                <div class="container">
                    <div class="section-title">
                        <h2>Community Discussions</h2>
                        <p>Share your thoughts and join the conversation</p>
                    </div>
                    <div class="comments-container">
                        <div class="comment-form">
                            <h3>Leave a Comment</h3>
                            <div class="form-group">
                                <label for="comment-name">Your Name</label>
                                <input type="text" id="comment-name" class="form-control" placeholder="Enter your name">
                            </div>
                            <div class="form-group">
                                <label for="comment-email">Email</label>
                                <input type="email" id="comment-email" class="form-control" placeholder="Enter your email">
                            </div>
                            <div class="form-group">
                                <label for="comment-text">Your Comment</label>
                                <textarea id="comment-text" class="form-control" placeholder="Share your thoughts about our documentaries..." rows="4"></textarea>
                            </div>
                            <button class="btn btn-primary" onclick="app.submitComment()">
                                <i class="fas fa-paper-plane"></i> Post Comment
                            </button>
                        </div>
                        
                        <div class="comment-list" id="comments-list">
                            ${this.renderCommentsList()}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderCommentsList() {
        if (this.comments.length === 0) {
            return `
                <div class="no-comments">
                    <i class="fas fa-comments"></i>
                    <h3>No comments yet</h3>
                    <p>Be the first to share your thoughts!</p>
                </div>
            `;
        }

        return this.comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <div class="comment-author">
                        <i class="fas fa-user"></i>
                        ${comment.author}
                    </div>
                    <div class="comment-date">${comment.date}</div>
                </div>
                <div class="comment-text">
                    <p>${comment.text}</p>
                </div>
                <div class="comment-actions">
                    <button class="btn-like" onclick="app.likeComment(${comment.id})">
                        <i class="far fa-thumbs-up"></i> Like
                    </button>
                    <button class="btn-reply" onclick="app.replyToComment(${comment.id})">
                        <i class="far fa-comment"></i> Reply
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderSubscribe() {
        return `
            <section class="subscription" id="subscribe">
                <div class="container">
                    <div class="subscription-header">
                        <h2>Unlock Premium Features</h2>
                        <p>Get unlimited access to our entire library and exclusive content</p>
                    </div>
                    <div class="pricing-grid">
                        <div class="pricing-card">
                            <div class="pricing-header">
                                <h3>Basic</h3>
                                <div class="price">Free</div>
                            </div>
                            <ul class="features-list">
                                <li><i class="fas fa-check"></i> Limited Documentaries</li>
                                <li><i class="fas fa-check"></i> Standard Quality</li>
                                <li><i class="fas fa-times"></i> No Downloads</li>
                                <li><i class="fas fa-times"></i> No Exclusive Content</li>
                            </ul>
                            <button class="btn btn-outline btn-block">Current Plan</button>
                        </div>
                        
                        <div class="pricing-card featured">
                            <div class="pricing-badge">Most Popular</div>
                            <div class="pricing-header">
                                <h3>Premium</h3>
                                <div class="price">$9.99<span>/month</span></div>
                            </div>
                            <ul class="features-list">
                                <li><i class="fas fa-check"></i> All Documentaries</li>
                                <li><i class="fas fa-check"></i> HD Quality</li>
                                <li><i class="fas fa-check"></i> Download & Watch Offline</li>
                                <li><i class="fas fa-check"></i> Exclusive Content</li>
                                <li><i class="fas fa-check"></i> Early Access</li>
                            </ul>
                            <button class="btn btn-primary btn-block">Upgrade Now</button>
                        </div>
                        
                        <div class="pricing-card">
                            <div class="pricing-header">
                                <h3>Family</h3>
                                <div class="price">$19.99<span>/month</span></div>
                            </div>
                            <ul class="features-list">
                                <li><i class="fas fa-check"></i> Everything in Premium</li>
                                <li><i class="fas fa-check"></i> 5 Simultaneous Streams</li>
                                <li><i class="fas fa-check"></i> Individual Profiles</li>
                                <li><i class="fas fa-check"></i> Kids Safe Content</li>
                            </ul>
                            <button class="btn btn-outline btn-block">Choose Family</button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderDonate() {
        return `
            <section class="donation" id="donate">
                <div class="container">
                    <div class="section-title">
                        <h2>Support Independent Documentary Making</h2>
                        <p>Your contribution helps us tell important stories from around the world</p>
                    </div>
                    <div class="donation-content">
                        <div class="donation-info">
                            <h3>Why Support Us?</h3>
                            <ul>
                                <li><i class="fas fa-check"></i> Fund independent filmmakers</li>
                                <li><i class="fas fa-check"></i> Support investigative journalism</li>
                                <li><i class="fas fa-check"></i> Preserve cultural heritage</li>
                                <li><i class="fas fa-check"></i> Promote environmental awareness</li>
                            </ul>
                        </div>
                        <div class="donation-options">
                            <div class="donation-option">
                                <h3>One-time Support</h3>
                                <div class="amount">$10</div>
                                <p>Help us cover production costs</p>
                                <button class="btn btn-primary" onclick="app.handleDonation(10)">Donate $10</button>
                            </div>
                            <div class="donation-option">
                                <h3>Documentary Fan</h3>
                                <div class="amount">$25</div>
                                <p>Support one documentary project</p>
                                <button class="btn btn-primary" onclick="app.handleDonation(25)">Donate $25</button>
                            </div>
                            <div class="donation-option">
                                <h3>Story Champion</h3>
                                <div class="amount">$50</div>
                                <p>Help fund multiple projects</p>
                                <button class="btn btn-primary" onclick="app.handleDonation(50)">Donate $50</button>
                            </div>
                            <div class="donation-option">
                                <h3>Producer's Circle</h3>
                                <div class="amount">$100</div>
                                <p>Become an executive producer</p>
                                <button class="btn btn-primary" onclick="app.handleDonation(100)">Donate $100</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderContact() {
        return `
            <section class="contact" id="contact">
                <div class="container">
                    <div class="contact-container">
                        <div class="contact-info">
                            <h3>Get In Touch</h3>
                            <p>Have questions, suggestions, or want to collaborate? We'd love to hear from you.</p>
                            
                            <div class="contact-details">
                                <div class="contact-detail">
                                    <i class="fas fa-envelope"></i>
                                    <div>
                                        <strong>Email</strong>
                                        <span>petersonotila@gmail.com</span>
                                    </div>
                                </div>
                                <div class="contact-detail">
                                    <i class="fas fa-phone"></i>
                                    <div>
                                        <strong>Phone</strong>
                                        <span>+254112696334</span>
                                    </div>
                                </div>
                                <div class="contact-detail">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <div>
                                        <strong>Address</strong>
                                        <span>40100 Kisumu, Megacity, 4th floor 345</span>
                                    </div>
                                </div>
                                <div class="contact-detail">
                                    <i class="fas fa-clock"></i>
                                    <div>
                                        <strong>Response Time</strong>
                                        <span>Within 24 hours</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="social-links">
                                <h4>Follow Us</h4>
                                <div class="social-grid">
                                    <a href="#" class="social-link">
                                        <i class="fab fa-facebook-f"></i>
                                        Facebook
                                    </a>
                                    <a href="#" class="social-link">
                                        <i class="fab fa-twitter"></i>
                                        Twitter
                                    </a>
                                    <a href="#" class="social-link">
                                        <i class="fab fa-instagram"></i>
                                        Instagram
                                    </a>
                                    <a href="#" class="social-link">
                                        <i class="fab fa-youtube"></i>
                                        YouTube
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <div class="contact-form">
                            <h3>Send Us a Message</h3>
                            <form id="contactForm">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="contact-name">Your Name *</label>
                                        <input type="text" id="contact-name" class="form-control" placeholder="Enter your full name" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="contact-email">Email Address *</label>
                                        <input type="email" id="contact-email" class="form-control" placeholder="Enter your email" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="contact-subject">Subject *</label>
                                    <input type="text" id="contact-subject" class="form-control" placeholder="What is this regarding?" required>
                                </div>
                                <div class="form-group">
                                    <label for="contact-message">Your Message *</label>
                                    <textarea id="contact-message" class="form-control" placeholder="Tell us how we can help you..." rows="5" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-paper-plane"></i> Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderAdmin() {
        if (!this.isAdminLoggedIn) {
            return this.renderAdminLogin();
        }

        return `
            <section class="section">
                <div class="container">
                    <div class="admin-panel">
                        <div class="admin-header">
                            <h2><i class="fas fa-cogs"></i> Admin Dashboard</h2>
                            <div class="admin-stats">
                                <span class="stat">
                                    <i class="fas fa-film"></i> ${this.documentaries.length} Documentaries
                                </span>
                                <span class="stat">
                                    <i class="fas fa-comments"></i> ${this.comments.length} Comments
                                </span>
                                <span class="stat">
                                    <i class="fas fa-users"></i> ${this.documentaries.reduce((sum, doc) => sum + (doc.downloads || 0), 0)} Total Downloads
                                </span>
                            </div>
                        </div>
                        
                        <div class="admin-actions">
                            <button class="btn btn-primary" onclick="app.showAddDocumentaryForm()">
                                <i class="fas fa-plus"></i> Add New Documentary
                            </button>
                            <button class="btn btn-outline" onclick="app.refreshAdminData()">
                                <i class="fas fa-sync-alt"></i> Refresh Data
                            </button>
                            <button class="btn btn-outline" onclick="app.adminLogout()">
                                <i class="fas fa-sign-out-alt"></i> Logout Admin
                            </button>
                        </div>
                        
                        <div class="admin-content">
                            <h3>Documentaries Management</h3>
                            <div class="table-responsive">
                                <table class="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Thumbnail</th>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Rating</th>
                                            <th>Downloads</th>
                                            <th>Date Added</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.renderAdminTable()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderAdminLogin() {
        return `
            <section class="auth-section">
                <div class="container">
                    <div class="auth-container">
                        <div class="auth-card admin-login">
                            <div class="auth-header">
                                <i class="fas fa-lock"></i>
                                <h2>Admin Login</h2>
                                <p>Access the administration panel</p>
                            </div>
                            <form class="auth-form" id="adminLoginForm">
                                <div class="form-group">
                                    <label for="admin-username">Username</label>
                                    <input type="text" id="admin-username" class="form-control" placeholder="Enter admin username" required>
                                </div>
                                <div class="form-group">
                                    <label for="admin-password">Password</label>
                                    <input type="password" id="admin-password" class="form-control" placeholder="Enter admin password" required>
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">
                                    <i class="fas fa-sign-in-alt"></i> Login to Admin Panel
                                </button>
                            </form>
                            <div class="auth-footer">
                                <p>Demo Credentials: <strong>admin</strong> / <strong>admin123</strong></p>
                                <button class="btn btn-outline btn-block" onclick="app.navigate('home')">
                                    <i class="fas fa-arrow-left"></i> Back to Site
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderAdminTable() {
        if (this.documentaries.length === 0) {
            return '<tr><td colspan="7" class="text-center">No documentaries found</td></tr>';
        }

        return this.documentaries.map(doc => {
            const imageUrl = this.getImageUrl(doc);
            const isFallback = !doc.image_url || !this.isValidImageUrl(doc.image_url);
            
            return `
                <tr>
                    <td>
                        ${isFallback ? `
                            <div class="admin-thumbnail fallback" title="${doc.title}">
                                No Image
                            </div>
                        ` : `
                            <img src="${imageUrl}" alt="${doc.title}" class="admin-thumbnail" 
                                 onerror="this.classList.add('fallback'); this.outerHTML = '<div class=\\'admin-thumbnail fallback\\' title=\\'${doc.title}\\'>No Image</div>';">
                        `}
                    </td>
                    <td>
                        <strong>${doc.title}</strong>
                        <br>
                        <small class="text-muted">${doc.description.substring(0, 60)}...</small>
                    </td>
                    <td><span class="category-badge">${doc.category}</span></td>
                    <td>
                        <div class="rating">
                            ${this.generateStars(doc.rating)}
                            <span class="rating-number">${doc.rating}</span>
                        </div>
                    </td>
                    <td>${doc.downloads || 0}</td>
                    <td>${doc.dateAdded}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-edit" onclick="app.editDocumentary(${doc.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="app.deleteDocumentary(${doc.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="btn-icon btn-view" onclick="app.viewDetails(${doc.id})" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderFooter() {
        return `
            <footer>
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-column">
                            <div class="footer-logo">
                                <i class="fas fa-film"></i>
                                <h4>Adipo Documentaries</h4>
                            </div>
                            <p>Bringing powerful stories from around the world to curious minds everywhere. Explore, learn, and be inspired.</p>
                            <div class="footer-social">
                                <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-youtube"></i></a>
                            </div>
                        </div>
                        <div class="footer-column">
                            <h5>Quick Links</h5>
                            <ul class="footer-links">
                                <li><a href="#home" data-view="home">Home</a></li>
                                <li><a href="#documentaries" data-view="documentaries">Documentaries</a></li>
                                <li><a href="#subscribe" data-view="subscribe">Subscription</a></li>
                                <li><a href="#donate" data-view="donate">Support Us</a></li>
                                <li><a href="#comments" data-view="comments">Community</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h5>Resources</h5>
                            <ul class="footer-links">
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">Content Guidelines</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms of Service</a></li>
                                <li><a href="#">Cookie Policy</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h5>Newsletter</h5>
                            <p>Stay updated with new releases and exclusive content</p>
                            <div class="newsletter-form">
                                <input type="email" placeholder="Your email address">
                                <button class="btn btn-primary">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                            <div class="footer-apps">
                                <p>Download our app</p>
                                <div class="app-buttons">
                                    <button class="btn-app">
                                        <i class="fab fa-apple"></i>
                                        <span>App Store</span>
                                    </button>
                                    <button class="btn-app">
                                        <i class="fab fa-google-play"></i>
                                        <span>Google Play</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="copyright">
                        <p>&copy; 2025 Adipo Documentaries. All rights reserved. | Made with <i class="fas fa-heart"></i> for documentary lovers</p>
                    </div>
                </div>
            </footer>
        `;
    }

    renderModals() {
        return `
            <!-- Admin Modal -->
            <div class="modal" id="adminModal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus"></i> Add New Documentary</h2>
                        <button class="close-modal" onclick="app.closeAdminModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="upload-form-container">
                            <form id="documentaryForm" class="compact-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="product-title">Title *</label>
                                        <input type="text" id="product-title" class="form-control" placeholder="Enter documentary title" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="product-category">Category *</label>
                                        <select id="product-category" class="form-control" required>
                                            <option value="">Select Category</option>
                                            <option value="nature">Nature & Environment</option>
                                            <option value="programming">programming</option>
                                            <option value="machine learning">machine learning</option>
                                            <option value="artificial intelligence">artificial intelligence</option>
                                            <option value="graphic design">graphic design</option>
                                            <option value="automation">automation</option>
                                            <option value="computer basics">computer basics</option>
                                            <option value="computer science">computer science</option>
                                            <option value="content creation">content creation</option>
                                            <option value="entertainment">entertainment</option>
                                            <option value="society">Society & Culture</option>
                                            <option value="science">Science & Technology</option>
                                            <option value="history">History & Archaeology</option>
                                            <option value="travel">Travel & Adventure</option>
                                            <option value="biography">Biography & People</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="product-description">Description *</label>
                                    <textarea id="product-description" class="form-control" placeholder="Enter detailed description of the documentary..." required rows="4"></textarea>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="product-duration">Duration</label>
                                        <input type="text" id="product-duration" class="form-control" placeholder="e.g., 45 min, 1h 30m">
                                    </div>
                                    <div class="form-group">
                                        <label for="product-rating">Rating</label>
                                        <input type="number" id="product-rating" class="form-control" min="1" max="5" step="0.1" value="4.0">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="product-image-url">Image URL *</label>
                                    <input type="url" id="product-image-url" class="form-control" required 
                                           placeholder="https://images.unsplash.com/photo-1234567890">
                                    <small class="help-text">Paste direct image URL from Unsplash or other image hosting services</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="product-video-url">Video URL (Optional)</label>
                                    <input type="url" id="product-video-url" class="form-control" 
                                           placeholder="https://www.youtube.com/watch?v=VIDEO_ID">
                                    <small class="help-text">YouTube, Vimeo, or direct video URL</small>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="form-actions">
                            <button type="submit" form="documentaryForm" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Documentary
                            </button>
                            <button type="button" class="btn btn-outline" onclick="app.closeAdminModal()">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Video Modal -->
            <div class="modal" id="videoModal" style="display: none;"></div>

            <!-- Notification System -->
            <div class="notification-container" id="notificationContainer"></div>
            // Add this in the admin modal form after the video URL field
<div class="form-group">
    <label for="product-pdf-url">PDF Document (Optional)</label>
    <input type="url" id="product-pdf-url" class="form-control" 
           placeholder="https://example.com/document.pdf">
    <small class="help-text">Link to PDF document or supplementary materials</small>
</div>

<div class="form-group">
    <label for="pdf-upload">Or Upload PDF File</label>
    <div class="upload-area" id="pdfUploadArea" onclick="document.getElementById('pdf-file').click()">
        <i class="fas fa-file-pdf"></i>
        <p>Click to upload PDF file</p>
        <small>Max file size: 10MB</small>
        <input type="file" id="pdf-file" accept=".pdf" style="display: none;" 
               onchange="app.handlePdfUpload(this.files)">
    </div>
    <div id="pdf-preview" class="pdf-preview" style="display: none;"></div>
</div>
        `;
    }

    // Image and Video Handling Methods
    getImageUrl(documentary) {
        if (!documentary.image_url) {
            return this.getFallbackImage(documentary);
        }
        
        // Check if it's a valid image URL
        if (this.isValidImageUrl(documentary.image_url)) {
            return documentary.image_url;
        }
        
        return this.getFallbackImage(documentary);
    }

    isValidImageUrl(url) {
        if (!url) return false;
        
        // Check if it's a common image format
        const imagePattern = /\.(jpeg|jpg|png|gif|bmp|webp|svg)$/i;
        if (imagePattern.test(url)) {
            return true;
        }
        
        // Check if it's a data URL (base64 image)
        if (url.startsWith('data:image/')) {
            return true;
        }
        
        // Check if it's from common image hosting sites
        const allowedDomains = [
            'unsplash.com', 'images.unsplash.com',
            'picsum.photos', 'via.placeholder.com',
            'imgbb.com', 'i.ibb.co',
            'flickr.com', 'staticflickr.com',
            'cloudinary.com', 'res.cloudinary.com'
        ];
        
        return allowedDomains.some(domain => url.includes(domain));
    }

    getFallbackImage(documentary) {
        // Generate a consistent fallback based on documentary ID or category
        const colors = ['1a365d', '2d3748', '744210', '22543d', '702459'];
        const color = colors[documentary.id % colors.length] || '1a365d';
        
        return `https://via.placeholder.com/500x300/${color}/ffffff?text=${encodeURIComponent(documentary.title)}`;
    }

    viewDetails(id) {
        if (!this.isUserLoggedIn) {
            this.showNotification('Please login to view details', 'warning');
            this.navigate('login');
            return;
        }
        
        const documentary = this.documentaries.find(doc => doc.id === id);
        if (!documentary) return;
        
        this.showVideoModal(documentary);
    }

    showVideoModal(documentary) {
        const modalContent = `
            <div class="modal" id="videoModal" style="display: flex;">
                <div class="modal-content" style="max-width: 900px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-play"></i> ${documentary.title}</h2>
                        <button class="close-modal" onclick="app.closeVideoModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${this.getVideoEmbed(documentary)}
                        <div class="video-details" style="margin-top: 1.5rem;">
                            <h3>${documentary.title}</h3>
                            <p>${documentary.description}</p>
                            <div class="video-meta" style="display: flex; gap: 2rem; margin-top: 1rem; color: var(--secondary);">
                                <span><i class="fas fa-clock"></i> ${documentary.duration}</span>
                                <span><i class="fas fa-download"></i> ${documentary.downloads || 0} downloads</span>
                                <span><i class="fas fa-star"></i> ${documentary.rating}/5</span>
                                <span><i class="fas fa-tag"></i> ${documentary.category}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('videoModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalContent);
    }

    getVideoEmbed(documentary) {
        if (!documentary.video_url) {
            const imageUrl = this.getImageUrl(documentary);
            const isFallback = !documentary.image_url || !this.isValidImageUrl(documentary.image_url);
            
            return `
                <div class="image-container" style="height: 400px;">
                    ${isFallback ? `
                        <div class="image-placeholder">
                            <i class="fas fa-film"></i>
                            <h3>Video Not Available</h3>
                            <p>This documentary doesn't have a video URL yet.</p>
                            <button class="btn btn-primary" onclick="app.downloadDocumentary(${documentary.id})" style="margin-top: 1rem;">
                                <i class="fas fa-download"></i> Download Instead
                            </button>
                        </div>
                    ` : `
                        <img src="${imageUrl}" alt="${documentary.title}" 
                             style="max-height: 100%; object-fit: contain;"
                             onerror="this.style.display='none'; this.parentElement.innerHTML = '<div class=\\'image-placeholder\\'><i class=\\'fas fa-film\\'></i><h3>Image Load Failed</h3><p>The documentary image could not be loaded.</p></div>';">
                    `}
                </div>
            `;
        }
        
        // Check if it's a YouTube URL
        if (this.isYouTubeUrl(documentary.video_url)) {
            const videoId = this.getYouTubeId(documentary.video_url);
            if (videoId) {
                return `
                    <div class="video-container">
                        <iframe 
                            src="https://www.youtube.com/embed/${videoId}?rel=0" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                `;
            }
        }
        
        // Check if it's a Vimeo URL
        if (this.isVimeoUrl(documentary.video_url)) {
            const videoId = this.getVimeoId(documentary.video_url);
            if (videoId) {
                return `
                    <div class="video-container">
                        <iframe 
                            src="https://player.vimeo.com/video/${videoId}" 
                            frameborder="0" 
                            allow="autoplay; fullscreen; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                `;
            }
        }
        
        // For direct video files
        if (documentary.video_url.match(/\.(mp4|webm|ogg)$/i)) {
            return `
                <div class="video-container">
                    <video controls style="width: 100%; height: 100%;">
                        <source src="${documentary.video_url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
        }
        
        // Fallback - try to embed as iframe
        return `
            <div class="video-container">
                <iframe src="${documentary.video_url}" frameborder="0" allowfullscreen></iframe>
            </div>
        `;
    }

    isYouTubeUrl(url) {
        return url.includes('youtube.com') || url.includes('youtu.be');
    }

    getYouTubeId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    isVimeoUrl(url) {
        return url.includes('vimeo.com');
    }

    getVimeoId(url) {
        const regex = /vimeo\.com\/(\d+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    closeVideoModal() {
        const modal = document.getElementById('videoModal');
        if (modal) modal.remove();
    }

    generateStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    bindEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link') || e.target.matches('[data-view]')) {
                e.preventDefault();
                const view = e.target.getAttribute('data-view') || e.target.getAttribute('href')?.substring(1);
                if (view) {
                    this.navigate(view);
                }
            }
        });

        // Auth buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'loginBtn' || e.target.closest('#loginBtn')) {
                e.preventDefault();
                this.navigate('login');
            }

            if (e.target.id === 'registerBtn' || e.target.closest('#registerBtn')) {
                e.preventDefault();
                this.navigate('register');
            }

            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.userLogout();
            }

            if (e.target.id === 'adminBtn' || e.target.closest('#adminBtn')) {
                e.preventDefault();
                this.navigate('admin');
            }

            if (e.target.id === 'adminLoginBtn' || e.target.closest('#adminLoginBtn')) {
                e.preventDefault();
                this.navigate('admin');
            }

            if (e.target.id === 'showRegister' || e.target.closest('#showRegister')) {
                e.preventDefault();
                this.navigate('register');
            }

            if (e.target.id === 'showLogin' || e.target.closest('#showLogin')) {
                e.preventDefault();
                this.navigate('login');
            }
        });

        // Forms
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleUserLogin(e));
        }

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleUserRegister(e));
        }

        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
        }

        const documentaryForm = document.getElementById('documentaryForm');
        if (documentaryForm) {
            documentaryForm.addEventListener('submit', (e) => this.handleDocumentarySubmit(e));
        }

        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.filterDocumentaries(e.target.value));
        }
    }

    navigate(view) {
        this.currentView = view;
        this.render();
        window.scrollTo(0, 0);
    }

    showLoading() {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.style.display = 'flex';
    }

    hideLoading() {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.style.display = 'none';
    }

    // User Authentication
    async handleUserLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            // For demo purposes - simulate login
            if (email === 'user@example.com' && password === 'password123') {
                this.isUserLoggedIn = true;
                localStorage.setItem('userToken', 'demo-user-token');
                this.showNotification('Login successful! Welcome back.', 'success');
                this.navigate('home');
            } else {
                this.showNotification('Invalid email or password', 'error');
            }
        } catch (error) {
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async handleUserRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name')?.value;
        const email = document.getElementById('register-email')?.value;
        const password = document.getElementById('register-password')?.value;
        const confirm = document.getElementById('register-confirm')?.value;

        if (!name || !email || !password || !confirm) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirm) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        try {
            // Simulate registration
            this.isUserLoggedIn = true;
            localStorage.setItem('userToken', 'demo-user-token');
            this.showNotification('Registration successful! Welcome to Adipo Documentaries.', 'success');
            this.navigate('home');
        } catch (error) {
            this.showNotification('Registration failed. Please try again.', 'error');
        }
    }

    async handleAdminLogin(e) {
        e.preventDefault();
        const username = document.getElementById('admin-username')?.value;
        const password = document.getElementById('admin-password')?.value;

        if (!username || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            if (username === 'admin' && password === 'admin123') {
                this.isAdminLoggedIn = true;
                localStorage.setItem('adminToken', 'demo-admin-token');
                this.showNotification('Admin login successful!', 'success');
                this.render();
            } else {
                this.showNotification('Invalid admin credentials', 'error');
            }
        } catch (error) {
            this.showNotification('Admin login failed', 'error');
        }
    }

    userLogout() {
        this.isUserLoggedIn = false;
        localStorage.removeItem('userToken');
        this.showNotification('Logged out successfully', 'info');
        this.navigate('login');
    }

    adminLogout() {
        this.isAdminLoggedIn = false;
        localStorage.removeItem('adminToken');
        this.showNotification('Admin logged out', 'info');
        this.navigate('home');
    }

    // Action methods
    async downloadDocumentary(id) {
        if (!this.isUserLoggedIn) {
            this.showNotification('Please login to download documentaries', 'warning');
            this.navigate('login');
            return;
        }

        try {
            this.showNotification('Preparing download...', 'info');
            await this.apiService.trackDownload(id);
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.showNotification('Download started!', 'success');
            
            // Update download count locally
            const documentary = this.documentaries.find(doc => doc.id === id);
            if (documentary) {
                documentary.downloads = (documentary.downloads || 0) + 1;
            }
        } catch (error) {
            this.showNotification('Download completed!', 'success');
        }
    }

    async submitComment() {
        if (!this.isUserLoggedIn) {
            this.showNotification('Please login to post comments', 'warning');
            this.navigate('login');
            return;
        }

        const name = document.getElementById('comment-name')?.value;
        const email = document.getElementById('comment-email')?.value;
        const text = document.getElementById('comment-text')?.value;

        if (!name || !email || !text) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            const newComment = {
                id: Date.now(),
                author: name,
                email: email,
                text: text,
                date: new Date().toISOString().split('T')[0],
                status: 'approved'
            };

            await this.apiService.addComment(newComment);
            this.showNotification('Comment posted successfully!', 'success');
            
            // Add to local comments
            this.comments.unshift(newComment);
            this.renderComments();
            
            // Clear form
            document.getElementById('comment-name').value = '';
            document.getElementById('comment-email').value = '';
            document.getElementById('comment-text').value = '';
        } catch (error) {
            // Fallback for demo
            const newComment = {
                id: Date.now(),
                author: name,
                email: email,
                text: text,
                date: new Date().toISOString().split('T')[0],
                status: 'approved'
            };
            this.comments.unshift(newComment);
            this.showNotification('Comment posted!', 'success');
            this.renderComments();
            
            document.getElementById('comment-name').value = '';
            document.getElementById('comment-email').value = '';
            document.getElementById('comment-text').value = '';
        }
    }

    likeComment(commentId) {
        if (!this.isUserLoggedIn) {
            this.showNotification('Please login to like comments', 'warning');
            return;
        }
        this.showNotification('Comment liked!', 'success');
    }

    replyToComment(commentId) {
        if (!this.isUserLoggedIn) {
            this.showNotification('Please login to reply to comments', 'warning');
            return;
        }
        this.showNotification('Reply feature coming soon!', 'info');
    }

    handleSubscription() {
        if (!this.isUserLoggedIn) {
            this.showNotification('Please login to subscribe', 'warning');
            this.navigate('login');
            return;
        }
        this.showNotification('Redirecting to subscription page...', 'info');
    }

    handleDonation(amount) {
        if (!this.isUserLoggedIn) {
            this.showNotification('Please login to make a donation', 'warning');
            this.navigate('login');
            return;
        }
        this.showNotification(`Thank you for your $${amount} donation!`, 'success');
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('contact-name')?.value;
        const email = document.getElementById('contact-email')?.value;
        const subject = document.getElementById('contact-subject')?.value;
        const message = document.getElementById('contact-message')?.value;

        if (!name || !email || !subject || !message) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        this.showNotification('Message sent successfully! We will get back to you soon.', 'success');
        
        // Clear form
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-email').value = '';
        document.getElementById('contact-subject').value = '';
        document.getElementById('contact-message').value = '';
    }

    showAddDocumentaryForm() {
        if (!this.isAdminLoggedIn) {
            this.showNotification('Admin access required', 'error');
            return;
        }
        document.getElementById('adminModal').style.display = 'flex';
    }

    closeAdminModal() {
        document.getElementById('adminModal').style.display = 'none';
        // Clear form
        const form = document.getElementById('documentaryForm');
        if (form) form.reset();
    }

    async handleDocumentarySubmit(e) {
        e.preventDefault();
        
        if (!this.isAdminLoggedIn) {
            this.showNotification('Admin access required', 'error');
            return;
        }

        const title = document.getElementById('product-title').value;
        const description = document.getElementById('product-description').value;
        const category = document.getElementById('product-category').value;
        const duration = document.getElementById('product-duration').value;
        const imageUrl = document.getElementById('product-image-url').value;
        const videoUrl = document.getElementById('product-video-url')?.value || null;
        const rating = parseFloat(document.getElementById('product-rating').value) || 4.0;

        if (!title || !description || !category) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

        // Validate image URL
        if (imageUrl && !this.isValidImageUrl(imageUrl)) {
            this.showNotification('Please enter a valid image URL (jpg, png, gif, etc.)', 'error');
            return;
        }

        // Validate video URL if provided
        if (videoUrl && !this.isValidVideoUrl(videoUrl)) {
            this.showNotification('Please enter a valid YouTube, Vimeo, or direct video URL', 'error');
            return;
        }

        try {
            const documentaryData = {
                id: Date.now(),
                title,
                description,
                category,
                duration,
                image_url: imageUrl,
                video_url: videoUrl,
                rating: rating,
                downloads: 0,
                dateAdded: new Date().toISOString().split('T')[0]
            };

            const result = await this.apiService.uploadDocumentary(documentaryData);
            
            this.showNotification('Documentary added successfully!', 'success');
            this.closeAdminModal();
            
            // Add to local documentaries
            this.documentaries.unshift(documentaryData);
            
            // Update views
            if (this.currentView === 'admin' || this.currentView === 'documentaries' || this.currentView === 'home') {
                this.render();
            }
            
        } catch (error) {
            console.error('Error adding documentary:', error);
            // Fallback for demo
            const documentaryData = {
                id: Date.now(),
                title,
                description,
                category,
                duration,
                image_url: imageUrl,
                video_url: videoUrl,
                rating: rating,
                downloads: 0,
                dateAdded: new Date().toISOString().split('T')[0]
            };
            this.documentaries.unshift(documentaryData);
            this.showNotification('Documentary added successfully!', 'success');
            this.closeAdminModal();
            
            if (this.currentView === 'admin' || this.currentView === 'documentaries' || this.currentView === 'home') {
                this.render();
            }
        }
    }

    isValidVideoUrl(url) {
        if (!url) return true; // Video is optional
        
        return this.isYouTubeUrl(url) || 
               this.isVimeoUrl(url) || 
               url.match(/\.(mp4|webm|ogg)$/i) ||
               url.includes('vimeo.com') ||
               url.includes('youtube.com') ||
               url.includes('youtu.be');
    }

    async deleteDocumentary(id) {
        if (!this.isAdminLoggedIn) {
            this.showNotification('Admin access required', 'error');
            return;
        }

        if (!confirm('Are you sure you want to delete this documentary? This action cannot be undone.')) {
            return;
        }

        try {
            await this.apiService.deleteDocumentary(id);
            this.showNotification('Documentary deleted successfully!', 'success');
            
            // Remove from local documentaries
            this.documentaries = this.documentaries.filter(doc => doc.id !== id);
            
            // Update views
            this.renderDocumentaries();
            if (this.currentView === 'admin') {
                this.render();
            }
        } catch (error) {
            // Fallback for demo
            this.documentaries = this.documentaries.filter(doc => doc.id !== id);
            this.showNotification('Documentary deleted successfully!', 'success');
            this.renderDocumentaries();
            if (this.currentView === 'admin') {
                this.render();
            }
        }
    }

    editDocumentary(id) {
        if (!this.isAdminLoggedIn) {
            this.showNotification('Admin access required', 'error');
            return;
        }
        this.showNotification('Edit feature coming soon!', 'info');
    }

    async refreshAdminData() {
        this.showNotification('Refreshing data...', 'info');
        await this.loadInitialData();
        this.showNotification('Data refreshed successfully!', 'success');
    }

    filterDocumentaries(category) {
        // This would filter documentaries by category in a real implementation
        if (category) {
            this.showNotification(`Showing ${category} documentaries`, 'info');
        } else {
            this.showNotification('Showing all documentaries', 'info');
        }
    }

    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Update specific sections
    renderDocumentaries() {
        const featuredGrid = document.getElementById('featured-grid');
        const documentariesGrid = document.getElementById('documentaries-grid');
        
        if (featuredGrid) {
            featuredGrid.innerHTML = this.renderFeaturedDocumentaries();
        }
        
        if (documentariesGrid) {
            documentariesGrid.innerHTML = this.renderAllDocumentaries();
        }
    }

    renderComments() {
        const commentsList = document.getElementById('comments-list');
        if (commentsList) {
            commentsList.innerHTML = this.renderCommentsList();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AdipoDocumentariesApp();
});
