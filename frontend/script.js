
        // Simple Adipo Documentaries App - All in One
        class AdipoDocumentariesApp {
            constructor() {
                this.currentView = 'home';
                this.documentaries = [];
                this.comments = [];
                this.init();
            }

            async init() {
                // Hide loading immediately
                this.hideLoading();
                
                // Render initial content
                this.render();
                
                // Load data in background
                this.loadInitialData();
            }

            async loadInitialData() {
                this.showLoading();
                
                // Simulate API calls
                await Promise.all([
                    this.loadDocumentaries(),
                    this.loadComments()
                ]);
                
                this.hideLoading();
                
                // Update the view with real data
                this.renderDocumentaries();
                this.renderComments();
            }

            async loadDocumentaries() {
                // Mock data
                this.documentaries = [
                    {
                        id: 1,
                        title: "Wilderness Untamed",
                        description: "Explore the last remaining wilderness areas on Earth and the challenges they face in the modern world.",
                        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
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
                        image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1129&q=80",
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
                        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
                        category: "culture",
                        rating: 4.8,
                        downloads: 1563,
                        dateAdded: "2023-06-03",
                        duration: "38 min"
                    }
                ];
                
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            async loadComments() {
                // Mock data
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
                
                await new Promise(resolve => setTimeout(resolve, 1000));
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
                return `
                    <header>
                        <div class="container">
                            <div class="header-content">
                                <div class="logo">
                                    <i class="fas fa-film"></i>
                                    <h1>Adipo collection page</h1>
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
                                    <button class="btn btn-outline" id="loginBtn">Login</button>
                                    <button class="btn btn-primary" id="adminBtn">Admin</button>
                                </div>
                            </div>
                        </div>
                    </header>
                `;
            }

            renderCurrentView() {
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
                    default:
                        return this.renderHome();
                }
            }

            renderHome() {
                return `
                    <section class="hero" id="home">
                        <div class="container">
                            <div class="hero-content">
                                <h2>Explore the best collection of documentaries</h2>
                                <p>Adipo Documentaries brings you compelling stories from around the globe. Subscribe to access our exclusive content, download documentaries, and join our community of curious minds.</p>
                                <div class="hero-buttons">
                                    <button class="btn btn-primary" data-view="documentaries">
                                        Explore Documentaries
                                    </button>
                                    <button class="btn btn-outline" data-view="subscribe">
                                        Subscribe Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="section">
                        <div class="container">
                            <div class="section-title">
                                <h2>Featured Documentaries</h2>
                                <p>Discover our most popular documentaries covering a wide range of topics</p>
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

                return this.documentaries.slice(0, 3).map(doc => `
                    <div class="documentary-card">
                        <div class="card-img" style="background-image: url('${doc.image}')"></div>
                        <div class="card-content">
                            <h3>${doc.title}</h3>
                            <p>${doc.description}</p>
                            <div class="card-meta">
                                <div class="rating">
                                    ${this.generateStars(doc.rating)}
                                </div>
                                <div class="card-actions">
                                    <div class="btn-icon" title="Download" onclick="app.downloadDocumentary(${doc.id})">
                                        <i class="fas fa-download"></i>
                                    </div>
                                    <div class="btn-icon" title="Add to favorites" onclick="app.toggleFavorite(${doc.id})">
                                        <i class="far fa-heart"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }

            renderDocumentariesView() {
                return `
                    <section class="section" id="documentaries">
                        <div class="container">
                            <div class="section-title">
                                <h2>All Documentaries</h2>
                                <p>Browse our complete collection of documentaries</p>
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
                        </div>
                    `;
                }

                return this.documentaries.map(doc => `
                    <div class="documentary-card">
                        <div class="card-img" style="background-image: url('${doc.image}')"></div>
                        <div class="card-content">
                            <h3>${doc.title}</h3>
                            <p>${doc.description}</p>
                            <div class="card-meta">
                                <span class="category-tag">${doc.category}</span>
                                <div class="rating">
                                    ${this.generateStars(doc.rating)}
                                </div>
                            </div>
                            <div class="card-actions">
                                <button class="btn btn-outline" onclick="app.downloadDocumentary(${doc.id})">
                                    <i class="fas fa-download"></i> Download
                                </button>
                                <button class="btn btn-primary" onclick="app.viewDetails(${doc.id})">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }

            renderCommentsView() {
                return `
                    <section class="comments-section" id="comments">
                        <div class="container">
                            <div class="section-title">
                                <h2>What Our Viewers Say</h2>
                                <p>Join the conversation and share your thoughts on our documentaries.</p>
                            </div>
                            <div class="comments-container">
                                <div class="comment-form">
                                    <h3>Leave a Comment</h3>
                                    <div class="form-group">
                                        <label for="comment-name">Name</label>
                                        <input type="text" id="comment-name" class="form-control" placeholder="Your name">
                                    </div>
                                    <div class="form-group">
                                        <label for="comment-email">Email</label>
                                        <input type="email" id="comment-email" class="form-control" placeholder="Your email">
                                    </div>
                                    <div class="form-group">
                                        <label for="comment-text">Comment</label>
                                        <textarea id="comment-text" class="form-control" placeholder="Your thoughts..."></textarea>
                                    </div>
                                    <button class="btn btn-primary" onclick="app.submitComment()">Submit Comment</button>
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
                    return '<div class="loading-comments">Loading comments...</div>';
                }

                return this.comments.map(comment => `
                    <div class="comment">
                        <div class="comment-header">
                            <div class="comment-author">${comment.author}</div>
                            <div class="comment-date">${comment.date}</div>
                        </div>
                        <div class="comment-text">
                            <p>${comment.text}</p>
                        </div>
                    </div>
                `).join('');
            }

            renderSubscribe() {
                return `
                    <section class="subscription" id="subscribe">
                        <div class="container">
                            <h2>Subscribe to Our Premium Content</h2>
                            <p>Get unlimited access to our entire library of documentaries, exclusive content, and early releases.</p>
                            <div class="subscription-form">
                                <input type="email" id="subscribeEmail" placeholder="Enter your email address">
                                <button onclick="app.handleSubscription()">Subscribe Now</button>
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
                                <h2>Support Our Work</h2>
                                <p>Your donations help us continue producing high-quality documentaries and telling important stories from around the world.</p>
                            </div>
                            <div class="donation-options">
                                <div class="donation-option">
                                    <h3>Basic Support</h3>
                                    <div class="amount">$10</div>
                                    <button class="btn btn-primary" onclick="app.handleDonation(10)">Donate</button>
                                </div>
                                <div class="donation-option">
                                    <h3>Documentary Fan</h3>
                                    <div class="amount">$25</div>
                                    <button class="btn btn-primary" onclick="app.handleDonation(25)">Donate</button>
                                </div>
                                <div class="donation-option">
                                    <h3>Story Champion</h3>
                                    <div class="amount">$50</div>
                                    <button class="btn btn-primary" onclick="app.handleDonation(50)">Donate</button>
                                </div>
                                <div class="donation-option">
                                    <h3>Producer's Circle</h3>
                                    <div class="amount">$100</div>
                                    <button class="btn btn-primary" onclick="app.handleDonation(100)">Donate</button>
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
                                    <p>Have questions or want to collaborate? Reach out to us through any of the following channels.</p>
                                    
                                    <div class="contact-details">
                                        <div class="contact-detail">
                                            <i class="fas fa-envelope"></i>
                                            <span>petersonotila@gmail.com</span>
                                        </div>
                                        <div class="contact-detail">
                                            <i class="fas fa-phone"></i>
                                            <span>+254112696334</span>
                                        </div>
                                        <div class="contact-detail">
                                            <i class="fas fa-map-marker-alt"></i>
                                            <span>40100 Kisumu, Megacity, 4th floor 345</span>
                                        </div>
                                    </div>
                                    
                                    <div class="social-links">
                                        <a href="#" class="social-link">
                                            <i class="fab fa-facebook-f"></i>
                                        </a>
                                        <a href="#" class="social-link">
                                            <i class="fab fa-twitter"></i>
                                        </a>
                                        <a href="#" class="social-link">
                                            <i class="fab fa-instagram"></i>
                                        </a>
                                        <a href="#" class="social-link">
                                            <i class="fab fa-youtube"></i>
                                        </a>
                                    </div>
                                </div>
                                
                                <div class="contact-form">
                                    <h3>Send Us a Message</h3>
                                    <div class="form-group">
                                        <label for="contact-name">Name</label>
                                        <input type="text" id="contact-name" class="form-control" placeholder="Your name">
                                    </div>
                                    <div class="form-group">
                                        <label for="contact-email">Email</label>
                                        <input type="email" id="contact-email" class="form-control" placeholder="Your email">
                                    </div>
                                    <div class="form-group">
                                        <label for="contact-subject">Subject</label>
                                        <input type="text" id="contact-subject" class="form-control" placeholder="Subject">
                                    </div>
                                    <div class="form-group">
                                        <label for="contact-message">Message</label>
                                        <textarea id="contact-message" class="form-control" placeholder="Your message"></textarea>
                                    </div>
                                    <button class="btn btn-primary" onclick="app.sendMessage()">Send Message</button>
                                </div>
                            </div>
                        </div>
                    </section>
                `;
            }

            renderAdmin() {
                return `
                    <section class="section">
                        <div class="container">
                            <div class="admin-panel">
                                <div class="admin-header">
                                    <h2><i class="fas fa-cogs"></i> Admin Panel</h2>
                                </div>
                                
                                <div class="admin-actions">
                                    <button class="btn btn-primary" onclick="app.showAddDocumentaryForm()">
                                        <i class="fas fa-plus"></i> Add New Documentary
                                    </button>
                                </div>
                                
                                <table class="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Rating</th>
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
                    </section>
                `;
            }

            renderAdminTable() {
                if (this.documentaries.length === 0) return '<tr><td colspan="5">No documentaries found</td></tr>';

                return this.documentaries.map(doc => `
                    <tr>
                        <td>${doc.title}</td>
                        <td><span class="category-badge">${doc.category}</span></td>
                        <td>${this.generateStars(doc.rating)}</td>
                        <td>${doc.dateAdded}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon" onclick="app.editDocumentary(${doc.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" onclick="app.deleteDocumentary(${doc.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }

            renderFooter() {
                return `
                    <footer>
                        <div class="container">
                            <div class="footer-content">
                                <div class="footer-column">
                                    <h4>Adipo collection page</h4>
                                    <p>Bringing powerful stories from around the world to curious minds everywhere.</p>
                                </div>
                                <div class="footer-column">
                                    <h4>Quick Links</h4>
                                    <ul class="footer-links">
                                        <li><a href="#home" data-view="home">Home</a></li>
                                        <li><a href="#documentaries" data-view="documentaries">Documentaries</a></li>
                                        <li><a href="#subscribe" data-view="subscribe">Subscribe</a></li>
                                        <li><a href="#donate" data-view="donate">Donate</a></li>
                                    </ul>
                                </div>
                                <div class="footer-column">
                                    <h4>Resources</h4>
                                    <ul class="footer-links">
                                        <li><a href="#">FAQ</a></li>
                                        <li><a href="#">Support</a></li>
                                        <li><a href="#">Privacy Policy</a></li>
                                        <li><a href="#">Terms of Service</a></li>
                                    </ul>
                                </div>
                                <div class="footer-column">
                                    <h4>Newsletter</h4>
                                    <p>Subscribe to our newsletter for updates on new releases and exclusive content.</p>
                                    <div class="subscription-form">
                                        <input type="email" placeholder="Your email">
                                        <button><i class="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            </div>
                            <div class="copyright">
                                <p>&copy; 2025 Adipo collection page. All rights reserved.</p>
                            </div>
                        </div>
                    </footer>
                `;
            }

            renderModals() {      //admin page
                return `
                    <div class="modal" id="adminModal" style="display: none;">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h2>Admin Panel</h2>
                                <button class="close-modal" onclick="app.closeAdminModal()">&times;</button>
                            </div>
                            <div class="admin-form">
                                <h3>Add New Documentary</h3>
                                <div class="form-group">
                                    <label for="product-title">Title</label>
                                    <input type="text" id="product-title" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="product-description">Description</label>
                                    <textarea id="product-description" class="form-control"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="product-image">Image URL</label>
                                    <input type="text" id="product-image" class="form-control">
                                </div>
                                <div class="form-actions">
                                    <button class="btn btn-primary" onclick="app.saveDocumentary()">Save Documentary</button>
                                    <button class="btn btn-outline" onclick="app.closeAdminModal()">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
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

                // Admin button
                document.addEventListener('click', (e) => {
                    if (e.target.id === 'adminBtn' || e.target.closest('#adminBtn')) {
                        this.navigate('admin');
                    }
                });

                // Login button
                document.addEventListener('click', (e) => {
                    if (e.target.id === 'loginBtn' || e.target.closest('#loginBtn')) {
                        this.showNotification('disabled', 'info');
                    }
                });
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

            // Action methods
            async downloadDocumentary(id) {
                this.showNotification('Download started...', 'info');
                // Simulate download
                await new Promise(resolve => setTimeout(resolve, 2000));
                this.showNotification('Download completed!', 'success');
            }

            toggleFavorite(id) {
                this.showNotification('Added to favorites!', 'success');
            }

            viewDetails(id) {
                this.showNotification('Feature coming soon!', 'info');
            }

            async submitComment() {
                const name = document.getElementById('comment-name')?.value;
                const email = document.getElementById('comment-email')?.value;
                const text = document.getElementById('comment-text')?.value;

                if (!name || !email || !text) {
                    this.showNotification('Please fill in all fields', 'error');
                    return;
                }

                this.showNotification('Comment submitted for review!', 'success');
                
                // Clear form
                document.getElementById('comment-name').value = '';
                document.getElementById('comment-email').value = '';
                document.getElementById('comment-text').value = '';
            }

            handleSubscription() {
                const email = document.getElementById('subscribeEmail')?.value;
                if (email && this.validateEmail(email)) {
                    this.showNotification('Thank you for subscribing!', 'success');
                    document.getElementById('subscribeEmail').value = '';
                } else {
                    this.showNotification('Please enter a valid email', 'error');
                }
            }

            handleDonation(amount) {
                this.showNotification(`Thank you for your $${amount} donation!`, 'success');
            }

            sendMessage() {
                this.showNotification('Message sent successfully!', 'success');
                
                // Clear form
                document.getElementById('contact-name').value = '';
                document.getElementById('contact-email').value = '';
                document.getElementById('contact-subject').value = '';
                document.getElementById('contact-message').value = '';
            }

            showAddDocumentaryForm() {
                document.getElementById('adminModal').style.display = 'flex';
            }

            closeAdminModal() {
                document.getElementById('adminModal').style.display = 'none';
            }

            saveDocumentary() {
                this.showNotification('Documentary added successfully!', 'success');
                this.closeAdminModal();
            }

            editDocumentary(id) {
                this.showNotification('Edit feature coming soon!', 'info');
            }

            deleteDocumentary(id) {
                if (confirm('Are you sure you want to delete this documentary?')) {
                    this.showNotification('Documentary deleted!', 'success');
                }
            }

            showNotification(message, type = 'info') {
                // Remove existing notifications
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

            validateEmail(email) {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return re.test(email);
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
    