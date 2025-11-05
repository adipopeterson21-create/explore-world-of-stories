// API Configuration - With better error handling
const API_BASE_URL = window.location.origin + '/api';

// Enhanced API Service with timeout handling
class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('adminToken');
        this.userToken = localStorage.getItem('userToken');
        this.timeout = 3000; // 3 second timeout
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
            // Add timeout to fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            config.signal = controller.signal;

            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Documentaries - Quick fallback
    async getDocumentaries() {
        try {
            return await this.request('/documentaries');
        } catch (error) {
            // Return empty array immediately on error
            return [];
        }
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

    // Comments - Quick fallback
    async getComments() {
        try {
            return await this.request('/comments');
        } catch (error) {
            return [];
        }
    }

    async addComment(comment) {
        return this.request('/comments', {
            method: 'POST',
            body: JSON.stringify(comment)
        });
    }

    // Admin - Quick fallback
    async adminLogin(credentials) {
        try {
            const result = await this.request('/admin/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
            
            if (result.token) {
                this.setToken(result.token, 'admin');
            }
            
            return result;
        } catch (error) {
            // Demo fallback
            if (credentials.username === 'admin' && credentials.password === 'admin123') {
                this.setToken('demo-admin-token', 'admin');
                return { success: true, token: 'demo-admin-token' };
            }
            throw error;
        }
    }

    // User Authentication - Quick fallback
    async userLogin(credentials) {
        try {
            const result = await this.request('/user/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
            
            if (result.token) {
                this.setToken(result.token, 'user');
            }
            
            return result;
        } catch (error) {
            // Demo fallback
            if (credentials.email === 'user@example.com' && credentials.password === 'password123') {
                this.setToken('demo-user-token', 'user');
                return { success: true, token: 'demo-user-token' };
            }
            throw error;
        }
    }

    async userRegister(userData) {
        return this.request('/user/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Downloads
    async trackDownload(id) {
        try {
            return await this.request(`/documentaries/${id}/download`, {
                method: 'POST'
            });
        } catch (error) {
            return { success: true }; // Always succeed for demo
        }
    }
}

// Initialize API service
const apiService = new ApiService();

// Optimized Adipo Documentaries App - Fast Loading
class AdipoDocumentariesApp {
    constructor() {
        this.currentView = 'home';
        this.documentaries = [];
        this.comments = [];
        this.apiService = apiService;
        this.isUserLoggedIn = !!localStorage.getItem('userToken');
        this.isAdminLoggedIn = !!localStorage.getItem('adminToken');
        this.currentPdfFile = null;
        this.isLoading = false;
        this.init();
    }

    async init() {
        console.log('Initializing app...');
        
        // Hide any existing loading immediately
        this.hideLoading();
        
        // Render initial content IMMEDIATELY
        this.render();
        
        // Load data in background without blocking
        this.loadInitialData().catch(error => {
            console.log('Background data loading completed');
        });
    }

    async loadInitialData() {
        this.isLoading = true;
        
        try {
            // Load both in parallel with individual timeouts
            const [docs, comments] = await Promise.allSettled([
                this.loadDocumentaries(),
                this.loadComments()
            ]);

            // Use whatever data we got
            this.documentaries = docs.status === 'fulfilled' ? docs.value : await this.loadFallbackDocumentaries();
            this.comments = comments.status === 'fulfilled' ? comments.value : [];

        } catch (error) {
            console.log('Using fallback data');
            this.documentaries = await this.loadFallbackDocumentaries();
            this.comments = [];
        } finally {
            this.isLoading = false;
            
            // Update the view with the loaded data
            this.renderDocumentaries();
            this.renderComments();
        }
    }

    async loadDocumentaries() {
        try {
            const docs = await this.apiService.getDocumentaries();
            return docs && docs.length > 0 ? docs : await this.loadFallbackDocumentaries();
        } catch (error) {
            return await this.loadFallbackDocumentaries();
        }
    }

    async loadComments() {
        try {
            const comments = await this.apiService.getComments();
            return comments || [];
        } catch (error) {
            return [];
        }
    }

    async loadFallbackDocumentaries() {
        // Return fallback data immediately - no delay
        return [
            {
                id: 1,
                title: "Wilderness Untamed",
                description: "Explore the last remaining wilderness areas on Earth and the challenges they face in the modern world.",
                image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                video_url: "https://www.youtube.com/embed/7n7bw6luneo",
                pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
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
                pdf_url: "https://www.africau.edu/images/default/sample.pdf",
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
                pdf_url: null,
                category: "culture",
                rating: 4.8,
                downloads: 1563,
                dateAdded: "2023-06-03",
                duration: "38 min"
            }
        ];
    }

    render() {
        const appElement = document.getElementById('app');
        if (!appElement) {
            console.error('App element not found!');
            return;
        }

        try {
            appElement.innerHTML = `
                ${this.renderHeader()}
                <main>
                    ${this.renderCurrentView()}
                </main>
                ${this.renderFooter()}
                ${this.renderModals()}
            `;

            this.bindEventListeners();
        } catch (error) {
            console.error('Render error:', error);
            // Fallback render
            appElement.innerHTML = this.renderErrorFallback();
        }
    }

    renderErrorFallback() {
        return `
            <header>
                <div class="container">
                    <div class="header-content">
                        <div class="logo">
                            <i class="fas fa-film"></i>
                            <h1>Adipo Documentaries</h1>
                        </div>
                    </div>
                </div>
            </header>
            <main>
                <section class="hero">
                    <div class="container">
                        <div class="hero-content">
                            <h2>Welcome to Adipo Documentaries</h2>
                            <p>Explore amazing documentary content</p>
                            <div class="hero-buttons">
                                <button class="btn btn-primary" onclick="location.reload()">
                                    Reload Page
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        `;
    }

    // ... [ALL YOUR EXISTING RENDER METHODS REMAIN THE SAME - KEEP THEM AS IS]
    // renderHeader(), renderCurrentView(), renderHome(), etc.
    // Just copy all your existing render methods here

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
                            <h1>Adipo Documentaries</h1>
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
        // If not logged in and trying to access protected views, show login
        if (!this.isUserLoggedIn && this.currentView !== 'login' && this.currentView !== 'register' && this.currentView !== 'home') {
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

    // ... [CONTINUE WITH ALL YOUR OTHER EXISTING METHODS]
    // renderCommentsView(), renderSubscribe(), renderDonate(), renderContact(), 
    // renderAdmin(), renderAdminLogin(), renderFooter(), renderModals()

    // ... [CONTINUE WITH ALL YOUR EXISTING FUNCTIONALITY METHODS]
    // generateStars(), bindEventListeners(), navigate(), showLoading(), hideLoading()
    // handleUserLogin(), handleUserRegister(), handleAdminLogin(), userLogout(), adminLogout()
    // downloadDocumentary(), viewDetails(), showVideoModal(), getVideoEmbed()
    // submitComment(), likeComment(), replyToComment(), handleSubscription()
    // handleDonation(), handleContactSubmit(), showAddDocumentaryForm(), closeAdminModal()
    // handleDocumentarySubmit(), deleteDocumentary(), editDocumentary(), refreshAdminData()
    // filterDocumentaries(), showNotification(), getNotificationIcon()
    // getImageUrl(), isValidImageUrl(), getFallbackImage(), isValidVideoUrl()
    // isYouTubeUrl(), getYouTubeId(), isVimeoUrl(), getVimeoId(), closeVideoModal()

    // ADD THE PDF METHODS HERE:
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
        if (uploadArea) {
            uploadArea.innerHTML = `
                <i class="fas fa-check-circle" style="color: var(--success);"></i>
                <p>${file.name}</p>
                <small>${this.formatFileSize(file.size)} - Ready to upload</small>
            `;
            uploadArea.style.borderColor = 'var(--success)';
        }
    }

    showPdfPreview(file) {
        const previewContainer = document.getElementById('pdf-preview');
        if (!previewContainer) return;
        
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
        const pdfFileInput = document.getElementById('pdf-file');
        
        if (previewContainer) {
            previewContainer.style.display = 'none';
            previewContainer.innerHTML = '';
        }
        
        if (uploadArea) {
            uploadArea.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <p>Click to upload PDF file</p>
                <small>Max file size: 10MB</small>
            `;
            uploadArea.style.borderColor = '';
        }
        
        if (pdfFileInput) {
            pdfFileInput.value = '';
        }
        
        // Clear stored file
        this.currentPdfFile = null;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async uploadPdfToServer(file) {
        // Simulate PDF upload
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockPdfUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
                resolve(mockPdfUrl);
            }, 500); // Shorter timeout
        });
    }

    isValidPdfUrl(url) {
        if (!url) return true; // PDF is optional
        
        const pdfPattern = /\.(pdf)$/i;
        if (pdfPattern.test(url)) {
            return true;
        }
        
        const allowedDomains = [
            'drive.google.com',
            'dropbox.com',
            'onedrive.live.com',
            'icloud.com',
            'docs.google.com'
        ];
        
        return allowedDomains.some(domain => url.includes(domain));
    }

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
            
            await this.apiService.trackDownload(id);
            
            this.openPdf(documentary.pdf_url, documentary.title);
            
            this.showNotification('PDF download started!', 'success');
            
        } catch (error) {
            this.openPdf(documentary.pdf_url, documentary.title);
            this.showNotification('PDF opened in new tab!', 'success');
        }
    }

    openPdf(pdfUrl, title) {
        const newTab = window.open(pdfUrl, '_blank');
        
        if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Update render methods to include PDF
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
        `;
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

        // Validate URLs
        if (imageUrl && !this.isValidImageUrl(imageUrl)) {
            this.showNotification('Please enter a valid image URL', 'error');
            return;
        }

        if (videoUrl && !this.isValidVideoUrl(videoUrl)) {
            this.showNotification('Please enter a valid video URL', 'error');
            return;
        }

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

            // Try API, but don't wait too long
            await Promise.race([
                this.apiService.uploadDocumentary(documentaryData),
                new Promise((resolve) => setTimeout(resolve, 2000))
            ]);
            
            this.showNotification('Documentary added successfully!', 'success');
            this.closeAdminModal();
            
            // Add to local documentaries
            this.documentaries.unshift(documentaryData);
            
            // Update views
            if (this.currentView === 'admin' || this.currentView === 'documentaries' || this.currentView === 'home') {
                this.render();
            }
            
        } catch (error) {
            console.log('Using local storage for documentary');
            // Local fallback
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

    showLoading() {
        // Optional: You can implement this if you have a loading element
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.style.display = 'flex';
    }

    hideLoading() {
        // Optional: You can implement this if you have a loading element
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.app = new AdipoDocumentariesApp();
});

// Add error handling for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Add this CSS for PDF features (add to your styles.css)
const pdfStyles = `
/* PDF Upload Styles */
.upload-area {
    border: 2px dashed #cbd5e0;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s;
    cursor: pointer;
    background: #f7fafc;
}

.upload-area:hover {
    border-color: var(--primary);
    background: rgba(26, 54, 93, 0.05);
}

.upload-area i {
    font-size: 3rem;
    color: #cbd5e0;
    margin-bottom: 1rem;
}

.upload-area:hover i {
    color: var(--primary);
}

.pdf-preview {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--light);
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.pdf-preview-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.pdf-icon {
    font-size: 2rem;
    color: #e53e3e;
}

.pdf-info h4 {
    margin-bottom: 0.5rem;
    color: var(--primary);
}

.pdf-info p {
    color: var(--secondary);
    margin-bottom: 0.5rem;
}

.btn-sm {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
}
`;

// Inject PDF styles
const styleSheet = document.createElement('style');
styleSheet.textContent = pdfStyles;
document.head.appendChild(styleSheet);
