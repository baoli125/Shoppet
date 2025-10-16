const CONFIG = {
    ADMIN_USER: 'LazyBeo',
    ADMIN_PASS: 'iloveyou',
    SELLER_USER: 'baoli',
    SELLER_PASS: 'baoli125',
    CONTACT_EMAIL: 'ShoppetLazyBeo@gmail.com'
};

// State Management
let state = {
    currentUser: null,
    products: {},
    services: {},
    currentPage: 'home',
    pets: [],
    cartItems: [],
    userPoints: 0,
    badges: [],
    chatHistory: [],
    petFoods: [],
    selectedPetId: null,
    currentSlide: 0,
    carouselInterval: null
};

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    mainContent: document.getElementById('main-content'),
    pages: document.querySelectorAll('.page'),
    navLinks: document.querySelectorAll('.nav-link')
};

// API Base URL
const API_BASE = '';

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Initialize all components
    initNavigation();
    initAuth();
    initMarketplace();
    initAIAssistant();
    initPetProfiles();
    initGamification();
    initCart();
    initFoodCalculation();
    initOrders();
    initCarousel();
    
    // Load initial data
    loadInitialData();
    updateAuthUI();
    checkDatabaseHealth();
    
    // Hide loading screen
    setTimeout(() => {
        elements.loading.classList.add('hidden');
        setTimeout(() => {
            elements.loading.style.display = 'none';
        }, 500);
    }, 1500);
}

// Carousel System
function initCarousel() {
    startCarousel();
}

function startCarousel() {
    // Clear existing interval
    if (state.carouselInterval) {
        clearInterval(state.carouselInterval);
    }
    
    // Start new interval
    state.carouselInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function nextSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    if (slides.length === 0) return;
    
    // Hide current slide
    slides[state.currentSlide]?.classList.remove('active');
    indicators[state.currentSlide]?.classList.remove('active');
    
    // Move to next slide
    state.currentSlide = (state.currentSlide + 1) % slides.length;
    
    // Show next slide
    slides[state.currentSlide]?.classList.add('active');
    indicators[state.currentSlide]?.classList.add('active');
}

function currentSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    if (slides.length === 0) return;
    
    // Hide current slide
    slides[state.currentSlide]?.classList.remove('active');
    indicators[state.currentSlide]?.classList.remove('active');
    
    // Set new slide
    state.currentSlide = index;
    
    // Show new slide
    slides[state.currentSlide]?.classList.add('active');
    indicators[state.currentSlide]?.classList.add('active');
    
    // Reset interval
    startCarousel();
}

// Navigation System
function initNavigation() {
    document.addEventListener('click', function(e) {
        const navLink = e.target.matches('.nav-link') ? e.target : e.target.closest('.nav-link');
        const loginBtn = e.target.matches('.login-btn') ? e.target : e.target.closest('.login-btn');
        
        if (navLink) {
            e.preventDefault();
            const targetPage = navLink.getAttribute('href').replace('#', '');
            closeAllModals();
            navigateTo(targetPage);
        }
        
        if (loginBtn) {
            e.preventDefault();
            openModal('login-modal');
        }
        
        if (e.target.matches('.logo') || e.target.closest('.logo')) {
            e.preventDefault();
            closeAllModals();
            navigateTo('home');
        }
    });

    window.addEventListener('hashchange', function() {
        const page = window.location.hash.replace('#', '') || 'home';
        closeAllModals();
        navigateTo(page);
    });

    const initialPage = window.location.hash.replace('#', '') || 'home';
    navigateTo(initialPage);
}

function navigateTo(page) {
    closeAllModals();
    
    elements.pages.forEach(p => p.classList.remove('active'));
    elements.navLinks.forEach(link => link.classList.remove('active'));
    
    const targetPage = document.getElementById(page);
    const targetNav = document.querySelector(`[href="#${page}"]`);
    
    if (targetPage) {
        targetPage.classList.add('active');
        if (targetNav) targetNav.classList.add('active');
        state.currentPage = page;
        
        window.location.hash = page;
        initPageFeatures(page);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        navigateTo('home');
    }
}

function initPageFeatures(page) {
    switch(page) {
        case 'marketplace':
            loadProducts();
            loadServices();
            break;
        case 'ai-assistant':
            initChat();
            break;
        case 'pet-profile':
            loadPetProfiles();
            break;
        case 'community':
            loadCommunityFeatures();
            break;
        case 'cart':
            loadCart();
            break;
        case 'orders':
            loadOrders();
            break;
    }
}

// Authentication System
function initAuth() {
    const savedUser = localStorage.getItem('shoppet_user');
    if (savedUser) {
        try {
            state.currentUser = JSON.parse(savedUser);
            if (state.currentUser && state.currentUser.id) {
                fetch(`/api/users/${state.currentUser.id}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch user data');
                        }
                        return response.json();
                    })
                    .then(user => {
                        state.currentUser = { ...state.currentUser, ...user };
                        localStorage.setItem('shoppet_user', JSON.stringify(state.currentUser));
                        updateAuthUI();
                        initGamification();
                    })
                    .catch(error => {
                        console.error('Error loading user data:', error);
                        updateAuthUI();
                        initGamification();
                    });
            } else {
                updateAuthUI();
                initGamification();
            }
        } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('shoppet_user');
            updateAuthUI();
        }
    } else {
        updateAuthUI();
    }

    document.addEventListener('click', function(e) {
        if (e.target.matches('.auth-tab')) {
            const tab = e.target.dataset.tab;
            switchAuthTab(tab);
        }
    });

    document.addEventListener('submit', function(e) {
        if (e.target.matches('#login-form')) {
            e.preventDefault();
            handleLogin(e.target);
        } else if (e.target.matches('#register-form')) {
            e.preventDefault();
            handleRegister(e.target);
        } else if (e.target.matches('#add-pet-form')) {
            e.preventDefault();
            handleAddPet(e.target);
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target.matches('.modal-close') || e.target.matches('.modal')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        }
    });
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
}

function handleLogin(form) {
    const formData = new FormData(form);
    const username = formData.get('username').trim();
    const password = formData.get('password');

    if (!username || !password) {
        showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang đăng nhập...';
    submitBtn.disabled = true;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Login failed') });
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        state.currentUser = data.user;
        state.userPoints = data.user.points || 0;
        state.badges = data.user.badges || [];
        
        showMessage(data.message || 'Đăng nhập thành công!', 'success');
        localStorage.setItem('shoppet_user', JSON.stringify(data.user));
        updateAuthUI();
        form.reset();
        closeModal('login-modal');
        navigateTo('home');
        
        loadPetProfiles();
        loadCart();
        initGamification();
    })
    .catch(error => {
        console.error('Login error:', error);
        showMessage(error.message || 'Lỗi kết nối server!', 'error');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

function handleRegister(form) {
    const formData = new FormData(form);
    const username = formData.get('username').trim();
    const password = formData.get('password');
    const email = formData.get('email').trim();
    const displayName = formData.get('displayName').trim();
    const role = formData.get('role');

    if (!username || !password || !email || !displayName || !role) {
        showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang đăng ký...';
    submitBtn.disabled = true;

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, displayName, role }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Registration failed') });
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        showMessage(data.message || 'Đăng ký thành công!', 'success');
        switchAuthTab('login');
        form.reset();
    })
    .catch(error => {
        console.error('Registration error:', error);
        showMessage(error.message || 'Lỗi kết nối server!', 'error');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const userAvatar = document.getElementById('user-avatar');
    const cartNav = document.querySelector('.cart-icon');
    const ordersNav = document.getElementById('orders-nav-link'); // ✅ Dùng ID

    if (state.currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            userInfo.style.alignItems = 'center';
            userInfo.style.gap = '10px';
        }
        if (usernameDisplay) {
            usernameDisplay.textContent = state.currentUser.display_name || state.currentUser.username;
        }
        if (userAvatar) {
            const initials = (state.currentUser.display_name || state.currentUser.username)
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            userAvatar.textContent = initials;
        }

        // Ẩn/Hiện giỏ hàng và đơn hàng dựa trên role
        if (cartNav) {
            if (state.currentUser.role === 'seller') {
                cartNav.style.display = 'none';
            } else {
                cartNav.style.display = 'flex';
            }
        }

        // ✅ SỬA LỖI: Cập nhật ĐÚNG CÁCH cho orders nav
        if (ordersNav) {
            const navTextElement = ordersNav.querySelector('.nav-text');
            if (navTextElement) {
                if (state.currentUser.role === 'seller') {
                    navTextElement.textContent = 'Quản lý đơn hàng';
                } else {
                    navTextElement.textContent = 'Đơn hàng';
                }
            } else {
                // Fallback: nếu không tìm thấy .nav-text, tạo lại cấu trúc
                ordersNav.innerHTML = `
                    <span class="nav-icon">🚚</span>
                    <span class="nav-text">${state.currentUser.role === 'seller' ? 'Quản lý đơn hàng' : 'Đơn hàng'}</span>
                `;
            }
        }
    } else {
        if (loginBtn) {
            loginBtn.style.display = 'block';
            loginBtn.textContent = 'Đăng nhập';
            loginBtn.href = 'javascript:void(0)';
            loginBtn.onclick = () => openModal('login-modal');
        }
        if (userInfo) userInfo.style.display = 'none';
        if (cartNav) cartNav.style.display = 'flex';
        
        // ✅ SỬA LỖI: Cập nhật ĐÚNG CÁCH khi không có user
        if (ordersNav) {
            const navTextElement = ordersNav.querySelector('.nav-text');
            if (navTextElement) {
                navTextElement.textContent = 'Đơn hàng';
            } else {
                // Fallback: tạo lại cấu trúc
                ordersNav.innerHTML = `
                    <span class="nav-icon">🚚</span>
                    <span class="nav-text">Đơn hàng</span>
                `;
            }
        }
    }
}

function logout() {
    state.currentUser = null;
    state.userPoints = 0;
    state.badges = [];
    state.pets = [];
    state.cartItems = [];
    
    localStorage.removeItem('shoppet_user');
    updateAuthUI();
    showMessage('Đã đăng xuất!', 'success');
    navigateTo('home');
}

// Order Management System
function initOrders() {
    document.addEventListener('click', function(e) {
        if (e.target.matches('.orders-tabs .tab-btn')) {
            const tab = e.target.dataset.tab;
            switchOrdersTab(tab);
        }
    });
}

function switchOrdersTab(tab) {
    document.querySelectorAll('.orders-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#orders .tab-content').forEach(content => content.classList.remove('active'));
    
    const tabButton = document.querySelector(`.orders-tabs [data-tab="${tab}"]`);
    const tabContent = document.getElementById(`${tab}-tab`);
    
    if (tabButton) tabButton.classList.add('active');
    if (tabContent) tabContent.classList.add('active');
}

function loadOrders() {
    if (!state.currentUser) {
        const ordersContainer = document.getElementById('customer-orders-container');
        if (ordersContainer) {
            ordersContainer.innerHTML = `
                <div class="text-center">
                    <div class="pet-avatar">📦</div>
                    <h3>Vui lòng đăng nhập</h3>
                    <p>Đăng nhập để xem đơn hàng của bạn</p>
                    <button class="btn btn-primary" onclick="openModal('login-modal')">Đăng nhập</button>
                </div>
            `;
        }
        return;
    }

    // CẬP NHẬT QUAN TRỌNG: Ẩn/hiện toàn bộ UI orders dựa trên role
    const ordersTabs = document.querySelector('.orders-tabs');
    const ordersTitle = document.getElementById('orders-title');
    const ordersSubtitle = document.getElementById('orders-subtitle');

    if (state.currentUser.role === 'seller') {
        // SELLER: Ẩn hoàn toàn phần customer orders, chỉ hiển thị seller orders
        if (ordersTabs) ordersTabs.style.display = 'none';
        if (ordersTitle) ordersTitle.textContent = 'Quản lý đơn hàng';
        if (ordersSubtitle) ordersSubtitle.textContent = 'Quản lý đơn hàng từ khách hàng';
        
        // Ẩn customer tab, hiển thị seller tab
        document.getElementById('customer-orders-tab').classList.remove('active');
        document.getElementById('seller-orders-tab').classList.add('active');
        
        loadSellerOrders();
    } else {
        // CUSTOMER: Ẩn hoàn toàn phần seller orders, chỉ hiển thị customer orders
        if (ordersTabs) ordersTabs.style.display = 'flex';
        if (ordersTitle) ordersTitle.textContent = 'Đơn hàng của bạn';
        if (ordersSubtitle) ordersSubtitle.textContent = 'Theo dõi và quản lý đơn hàng của bạn';
        
        // Ẩn seller tab, hiển thị customer tab
        document.getElementById('seller-orders-tab').classList.remove('active');
        document.getElementById('customer-orders-tab').classList.add('active');
        
        loadCustomerOrders();
    }
}

function loadCustomerOrders() {
    if (!state.currentUser || state.currentUser.role === 'seller') return;

    showLoading('customer-orders-container');
    
    fetch(`/api/orders/user/${state.currentUser.id}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(orders => {
        renderCustomerOrders(orders);
    })
    .catch(error => {
        console.error('Error loading customer orders:', error);
        const container = document.getElementById('customer-orders-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center">
                    <div class="pet-avatar">❌</div>
                    <h3>Lỗi tải đơn hàng</h3>
                    <p>Không thể tải dan sách đơn hàng: ${error.message}</p>
                    <button class="btn btn-primary" onclick="loadCustomerOrders()">Thử lại</button>
                </div>
            `;
        }
    });
}

function loadSellerOrders() {
    if (!state.currentUser || state.currentUser.role !== 'seller') return;

    showLoading('seller-orders-container');
    
    fetch(`/api/orders/seller/${state.currentUser.id}`)
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch seller orders');
        return response.json();
    })
    .then(orders => {
        renderSellerOrders(orders);
    })
    .catch(error => {
        console.error('Error loading seller orders:', error);
        const container = document.getElementById('seller-orders-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center">
                    <div class="pet-avatar">❌</div>
                    <h3>Lỗi tải đơn hàng</h3>
                    <p>Không thể tải danh sách đơn hàng người bán.</p>
                    <button class="btn btn-primary" onclick="loadSellerOrders()">Thử lại</button>
                </div>
            `;
        }
    });
}

function renderCustomerOrders(orders) {
    const container = document.getElementById('customer-orders-container');
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="text-center">
                <div class="pet-avatar">📦</div>
                <h3>Chưa có đơn hàng</h3>
                <p>Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!</p>
                <a href="#marketplace" class="btn btn-primary mt-2">Mua sắm ngay</a>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-info">
                    <h3>Đơn hàng #${order.id}</h3>
                    <p class="order-date">Ngày đặt: ${new Date(order.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                    ${order.seller_name ? `<p class="seller-info">🛒 Người bán: ${order.seller_name}</p>` : ''}
                </div>
                <div class="order-status">
                    <span class="status-badge status-${order.status}">${getOrderStatusText(order.status)}</span>
                    ${order.cancellation_reason ? `<p class="cancellation-reason">${order.cancellation_reason}</p>` : ''}
                </div>
            </div>
            
            <div class="order-items">
                ${order.items && order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image_url || '/images/products/default-food.png'}" 
                             alt="${item.product_name}" 
                             class="order-item-image"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+PC9zdmc+'">
                        <div class="order-item-info">
                            <h4>${item.product_name}</h4>
                            <p class="item-price">${formatPrice(item.product_price)}/kg × ${item.quantity_kg} kg</p>
                        </div>
                        <div class="order-item-total">${formatPrice(item.total_price)}</div>
                    </div>
                `).join('') || '<p>Không có sản phẩm</p>'}
            </div>
            
            <div class="order-footer">
                <div class="order-total">
                    <strong>Tổng cộng: ${formatPrice(order.total_amount)}</strong>
                </div>
                <div class="order-actions">
                    <button class="btn btn-outline btn-small" onclick="viewOrderDetail(${order.id})">
                        📋 Chi tiết
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-danger btn-small" onclick="showCancelOrderModal(${order.id}, 'user')">
                            ❌ Hủy đơn
                        </button>
                    ` : ''}
                    ${order.status === 'delivered' ? `
                        <button class="btn btn-success btn-small" onclick="rateOrder(${order.id})">
                            ⭐ Đánh giá
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderSellerOrders(orders) {
    const container = document.getElementById('seller-orders-container');
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="text-center">
                <div class="pet-avatar">🏪</div>
                <h3>Chưa có đơn hàng</h3>
                <p>Chưa có đơn hàng nào từ khách hàng.</p>
                <p class="text-muted">Các đơn hàng từ khách hàng sẽ xuất hiện tại đây.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-info">
                    <h3>Đơn hàng #${order.id}</h3>
                    <p class="customer-info"><strong>👤 Khách hàng:</strong> ${order.customer_name || 'N/A'}</p>
                    <p class="order-date"><strong>📅 Ngày đặt:</strong> ${new Date(order.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                    ${order.phone_number ? `<p class="contact-info"><strong>📞 Điện thoại:</strong> ${order.phone_number}</p>` : ''}
                    ${order.shipping_address ? `<p class="shipping-info"><strong>🏠 Địa chỉ:</strong> ${order.shipping_address}</p>` : ''}
                    ${order.customer_notes ? `<p class="customer-notes"><strong>📝 Ghi chú:</strong> ${order.customer_notes}</p>` : ''}
                </div>
                <div class="order-status">
                    <span class="status-badge status-${order.status}">${getOrderStatusText(order.status)}</span>
                </div>
            </div>
            
            <div class="order-items">
                ${order.items && order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image_url || '/images/products/default-food.png'}" 
                             alt="${item.product_name}" 
                             class="order-item-image"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1aZ2U8L3RleHQ+PC9zdmc+'">
                        <div class="order-item-info">
                            <h4>${item.product_name}</h4>
                            <p class="item-price">${formatPrice(item.product_price)}/kg × ${item.quantity_kg} kg</p>
                        </div>
                        <div class="order-item-total">${formatPrice(item.total_price)}</div>
                    </div>
                `).join('') || '<p>Không có sản phẩm</p>'}
            </div>
            
            <div class="order-footer">
                <div class="order-total">
                    <strong>Tổng cộng: ${formatPrice(order.total_amount)}</strong>
                </div>
                <div class="order-actions">
                    <button class="btn btn-outline btn-small" onclick="viewOrderDetail(${order.id})">
                        📋 Chi tiết
                    </button>
                    
                    ${order.status === 'pending' ? `
                        <button class="btn btn-success btn-small" onclick="updateOrderStatus(${order.id}, 'confirmed', 'Đã xác nhận đơn hàng')">
                            ✅ Xác nhận
                        </button>
                        <button class="btn btn-danger btn-small" onclick="showCancelOrderModal(${order.id}, 'seller')">
                            ❌ Từ chối
                        </button>
                    ` : ''}
                    
                    ${order.status === 'confirmed' ? `
                        <button class="btn btn-primary btn-small" onclick="updateOrderStatus(${order.id}, 'shipped', 'Đã giao hàng')">
                            🚚 Đã giao hàng
                        </button>
                        <button class="btn btn-danger btn-small" onclick="showCancelOrderModal(${order.id}, 'seller')">
                            ❌ Hủy đơn
                        </button>
                    ` : ''}
                    
                    ${order.status === 'shipped' ? `
                        <button class="btn btn-success btn-small" onclick="updateOrderStatus(${order.id}, 'delivered', 'Đã giao hàng thành công')">
                            ✅ Hoàn thành
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function getOrderStatusText(status) {
    const statusMap = {
        'pending': '🕒 Chờ xác nhận',
        'confirmed': '✅ Đã xác nhận',
        'shipped': '🚚 Đang giao hàng',
        'delivered': '📦 Đã giao',
        'cancelled': '❌ Đã hủy'
    };
    return statusMap[status] || status;
}

function viewOrderDetail(orderId) {
    showLoading('order-detail-content');
    
    fetch(`/api/orders/${orderId}`)
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch order details');
        return response.json();
    })
    .then(order => {
        showOrderDetailModal(order);
    })
    .catch(error => {
        console.error('Error loading order detail:', error);
        showMessage('Lỗi tải chi tiết đơn hàng!', 'error');
    });
}

function showOrderDetailModal(order) {
    const modalContent = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>📋 Chi tiết đơn hàng #${order.id}</h2>
                <button class="modal-close" onclick="closeModal('order-detail-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="order-detail" id="order-detail-content">
                    <div class="order-info-section">
                        <h3>📦 Thông tin đơn hàng</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Trạng thái:</strong>
                                <span class="status-badge status-${order.status}">${getOrderStatusText(order.status)}</span>
                            </div>
                            <div class="info-item">
                                <strong>Ngày đặt:</strong>
                                <span>${new Date(order.created_at).toLocaleString('vi-VN')}</span>
                            </div>
                            <div class="info-item">
                                <strong>Tổng tiền:</strong>
                                <span class="price">${formatPrice(order.total_amount)}</span>
                            </div>
                            ${order.customer_name ? `
                                <div class="info-item">
                                    <strong>Khách hàng:</strong>
                                    <span>${order.customer_name}</span>
                                </div>
                            ` : ''}
                            ${order.seller_name ? `
                                <div class="info-item">
                                    <strong>Người bán:</strong>
                                    <span>${order.seller_name}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    ${order.shipping_address || order.phone_number ? `
                    <div class="shipping-info-section">
                        <h3>🏠 Thông tin giao hàng</h3>
                        <div class="info-grid">
                            ${order.shipping_address ? `
                                <div class="info-item">
                                    <strong>Địa chỉ:</strong>
                                    <span>${order.shipping_address}</span>
                                </div>
                            ` : ''}
                            ${order.phone_number ? `
                                <div class="info-item">
                                    <strong>Điện thoại:</strong>
                                    <span>${order.phone_number}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}

                    <div class="order-items-section">
                        <h3>🛍️ Sản phẩm đã đặt</h3>
                        <div class="order-items-list">
                            ${order.items && order.items.map(item => `
                                <div class="order-detail-item">
                                    <img src="${item.image_url || '/images/products/default-food.png'}" 
                                         alt="${item.product_name}" 
                                         class="order-item-image"
                                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1aZ2U8L3RleHQ+PC9zdmc+'">
                                    <div class="item-details">
                                        <h4>${item.product_name}</h4>
                                        <p class="item-price">${formatPrice(item.product_price)}/kg × ${item.quantity_kg} kg</p>
                                    </div>
                                    <div class="item-total">${formatPrice(item.total_price)}</div>
                                </div>
                            `).join('') || '<p>Không có sản phẩm</p>'}
                        </div>
                    </div>

                    ${order.customer_notes ? `
                    <div class="customer-notes-section">
                        <h3>📝 Ghi chú của khách hàng</h3>
                        <p>${order.customer_notes}</p>
                    </div>
                    ` : ''}

                    ${order.cancellation_reason ? `
                    <div class="cancellation-section">
                        <h3>❌ Lý do hủy đơn</h3>
                        <p>${order.cancellation_reason}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    let modal = document.getElementById('order-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'order-detail-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = modalContent;
    openModal('order-detail-modal');
}

function updateOrderStatus(orderId, status, message = '') {
    const updateData = { status };
    if (message) {
        updateData.message = message;
    }

    fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update order status');
        return response.json();
    })
    .then(data => {
        showMessage(data.message || 'Cập nhật trạng thái thành công!', 'success');
        closeAllModals();
        loadOrders();
    })
    .catch(error => {
        console.error('Error updating order status:', error);
        showMessage('Lỗi cập nhật trạng thái đơn hàng!', 'error');
    });
}

function showCancelOrderModal(orderId, cancelBy = 'user') {
    const modalContent = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>❌ ${cancelBy === 'seller' ? 'Từ chối đơn hàng' : 'Hủy đơn hàng'}</h2>
                <button class="modal-close" onclick="closeModal('cancel-order-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <form id="cancel-order-form">
                    <div class="form-group">
                        <label for="cancellation-reason">Lý do ${cancelBy === 'seller' ? 'từ chối' : 'hủy'} *</label>
                        <textarea id="cancellation-reason" name="cancellationReason" required 
                                  placeholder="Vui lòng nhập lý do ${cancelBy === 'seller' ? 'từ chối' : 'hủy'} đơn hàng..."
                                  rows="4"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeModal('cancel-order-modal')">
                            Quay lại
                        </button>
                        <button type="submit" class="btn btn-danger">
                            ${cancelBy === 'seller' ? 'Từ chối đơn hàng' : 'Hủy đơn hàng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    let modal = document.getElementById('cancel-order-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cancel-order-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = modalContent;
    openModal('cancel-order-modal');

    document.getElementById('cancel-order-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const cancellationReason = formData.get('cancellationReason');
        
        cancelOrder(orderId, cancellationReason, cancelBy);
    });
}

function cancelOrder(orderId, cancellationReason = '', cancelBy = 'user') {
    const cancelData = { 
        status: 'cancelled',
        cancellationReason: cancellationReason || `Đơn hàng bị hủy bởi ${cancelBy === 'seller' ? 'người bán' : 'người mua'}`,
        cancelledBy: cancelBy
    };

    fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancelData),
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to cancel order');
        return response.json();
    })
    .then(data => {
        showMessage(data.message || 'Đã hủy đơn hàng!', 'success');
        closeAllModals();
        loadOrders();
    })
    .catch(error => {
        console.error('Error cancelling order:', error);
        showMessage('Lỗi khi hủy đơn hàng!', 'error');
    });
}

function rateOrder(orderId) {
    showMessage('Tính năng đánh giá đang được phát triển!', 'info');
}

// Enhanced checkout process
function checkout() {
    if (state.cartItems.length === 0) {
        showMessage('Giỏ hàng trống!', 'error');
        return;
    }

    if (!state.currentUser) {
        showMessage('Vui lòng đăng nhập để thanh toán!', 'error');
        openModal('login-modal');
        return;
    }

    // KIỂM TRA ROLE - SELLER KHÔNG THỂ THANH TOÁN
    if (state.currentUser.role === 'seller') {
        showMessage('Tài khoản seller không thể đặt hàng! Vui lòng sử dụng tài khoản khách hàng.', 'error');
        return;
    }

    showCheckoutModal();
}

function showCheckoutModal() {
    const totalAmount = calculateCartTotal();
    const totalKg = state.cartItems.reduce((sum, item) => sum + item.quantity_kg, 0).toFixed(1);

    const modalContent = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>💰 Thanh toán đơn hàng</h2>
                <button class="modal-close" onclick="closeModal('checkout-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <form id="checkout-form">
                    <div class="checkout-section">
                        <h3>🏠 Thông tin giao hàng</h3>
                        <div class="form-group">
                            <label for="shipping-address">Địa chỉ giao hàng *</label>
                            <textarea id="shipping-address" name="shippingAddress" required 
                                      placeholder="Nhập địa chỉ giao hàng đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="phone-number">Số điện thoại *</label>
                            <input type="tel" id="phone-number" name="phoneNumber" required 
                                   placeholder="Nhập số điện thoại liên hệ">
                        </div>
                        <div class="form-group">
                            <label for="customer-notes">Ghi chú cho người bán (tùy chọn)</label>
                            <textarea id="customer-notes" name="customerNotes" 
                                      placeholder="Ghi chú về đơn hàng, thời gian giao hàng, hoặc yêu cầu đặc biệt..."></textarea>
                        </div>
                    </div>

                    <div class="checkout-section">
                        <h3>🛍️ Thông tin đơn hàng</h3>
                        <div class="order-summary">
                            ${state.cartItems.map(item => {
                                const itemTotal = item.product_price * item.quantity_kg;
                                return `
                                <div class="order-summary-item">
                                    <div class="item-info">
                                        <h4>${item.product_name}</h4>
                                        <p>${formatPrice(item.product_price)}/kg × ${item.quantity_kg} kg</p>
                                    </div>
                                    <div class="item-total">${formatPrice(itemTotal)}</div>
                                </div>
                                `;
                            }).join('')}
                            
                            <div class="order-summary-total">
                                <div class="summary-row">
                                    <span>Tổng khối lượng:</span>
                                    <span>${totalKg} kg</span>
                                </div>
                                <div class="summary-row">
                                    <span>Số lượng sản phẩm:</span>
                                    <span>${state.cartItems.length}</span>
                                </div>
                                <div class="summary-row total">
                                    <strong>Tổng thanh toán:</strong>
                                    <strong class="price">${formatPrice(totalAmount)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="checkout-actions">
                        <button type="submit" class="btn btn-primary btn-large">
                            💳 Xác nhận đặt hàng
                        </button>
                        <p class="checkout-note">
                            Bằng cách xác nhận đặt hàng, bạn đồng ý với các điều khoản mua bán của Shoppet
                        </p>
                    </div>
                </form>
            </div>
        </div>
    `;

    let modal = document.getElementById('checkout-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'checkout-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = modalContent;
    openModal('checkout-modal');

    document.getElementById('checkout-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processCheckout();
    });
}

function processCheckout() {
    const formData = new FormData(document.getElementById('checkout-form'));
    const shippingAddress = formData.get('shippingAddress');
    const phoneNumber = formData.get('phoneNumber');
    const customerNotes = formData.get('customerNotes');

    if (!shippingAddress || !phoneNumber) {
        showMessage('Vui lòng điền đầy đủ thông tin giao hàng!', 'error');
        return;
    }

    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phoneNumber)) {
        showMessage('Số điện thoại không hợp lệ!', 'error');
        return;
    }

    const orderData = {
        userId: state.currentUser.id,
        items: state.cartItems.map(item => ({
            productId: item.product_id,
            productName: item.product_name,
            productPrice: item.product_price,
            quantityKg: item.quantity_kg,
            totalPrice: item.product_price * item.quantity_kg,
            productImage: item.product_image
        })),
        shippingAddress: shippingAddress,
        phoneNumber: phoneNumber,
        customerNotes: customerNotes,
        totalAmount: calculateCartTotal()
    };

    const submitBtn = document.querySelector('#checkout-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '🔄 Đang xử lý...';
    submitBtn.disabled = true;

    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to create order');
        return response.json();
    })
    .then(data => {
        showMessage('🎉 Đặt hàng thành công! Đơn hàng đang chờ người bán xác nhận.', 'success');
        closeModal('checkout-modal');
        
        clearCart();
        addPoints(100);
        navigateTo('orders');
    })
    .catch(error => {
        console.error('Error creating order:', error);
        showMessage('❌ Lỗi đặt hàng! Vui lòng thử lại.', 'error');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Đang tải...</p>
            </div>
        `;
    }
}

// Pet Profile System
function initPetProfiles() {
    // Will load from API when needed
}

function loadPetProfiles() {
    if (!state.currentUser) {
        const petProfilesContainer = document.getElementById('pet-profiles-container');
        const petDetailsContainer = document.getElementById('pet-details-container');
        
        if (petProfilesContainer) {
            petProfilesContainer.innerHTML = `
                <div class="text-center">
                    <div class="pet-avatar">🐾</div>
                    <h3>Vui lòng đăng nhập</h3>
                    <p>Đăng nhập để quản lý thú cưng của bạn</p>
                    <button class="btn btn-primary" onclick="openModal('login-modal')">Đăng nhập</button>
                </div>
            `;
        }
        if (petDetailsContainer) {
            petDetailsContainer.innerHTML = `
                <div class="text-center">
                    <p>Vui lòng đăng nhập để xem chi tiết</p>
                </div>
            `;
        }
        return;
    }

    fetch(`/api/pets/${state.currentUser.id}`)
    .then(response => response.json())
    .then(pets => {
        state.pets = pets;
        renderPetProfiles();
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Lỗi tải danh sách thú cưng!', 'error');
    });
}

function renderPetProfiles() {
    const petProfilesContainer = document.getElementById('pet-profiles-container');
    const petDetailsContainer = document.getElementById('pet-details-container');
    
    if (!petProfilesContainer || !petDetailsContainer) return;

    if (state.pets.length === 0) {
        petProfilesContainer.innerHTML = `
            <div class="text-center">
                <div class="pet-avatar">🐾</div>
                <h3>Chưa có thú cưng nào</h3>
                <p>Thêm thú cưng đầu tiên của bạn để bắt đầu!</p>
            </div>
        `;
        petDetailsContainer.innerHTML = `
            <div class="text-center">
                <p>Vui lòng thêm thú cưng để xem chi tiết</p>
            </div>
        `;
        return;
    }

    petProfilesContainer.innerHTML = state.pets.map(pet => `
        <div class="pet-basic-info" onclick="selectPet('${pet.id}')" style="cursor: pointer; border: 2px solid ${pet.id === state.selectedPetId ? 'var(--primary)' : 'transparent'}; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
            <div class="pet-avatar">${getPetEmoji(pet.type)}</div>
            <h3>${pet.name}</h3>
            <p class="nickname">"${pet.nickname || 'Chưa có biệt danh'}"</p>
            <p>${pet.breed} • ${pet.age} tuổi • ${pet.gender} </p>
            <small>${pet.vaccine_count || 0} vaccine</small>
        </div>
    `).join('');

    if (state.selectedPetId) {
        showPetDetails(state.selectedPetId);
    } else if (state.pets.length > 0) {
        selectPet(state.pets[0].id);
    }
}

function selectPet(petId) {
    state.selectedPetId = petId;
    renderPetProfiles();
}

function showPetDetails(petId) {
    const pet = state.pets.find(p => p.id == petId);
    const petDetailsContainer = document.getElementById('pet-details-container');
    
    if (!pet || !petDetailsContainer) return;

    petDetailsContainer.innerHTML = `
        <div class="pet-details">
            <div class="pet-detail-tabs">
                <button class="tab-btn active" data-tab="pet-info">Thông Tin Chung</button>
                <button class="tab-btn" data-tab="food-calculation">🍖 Tính Toán Thức Ăn</button>
            </div>

            <div id="pet-info-tab" class="tab-content active">
                <div class="insurance-card">
                    <h3>🛡️ Bảo hiểm Thú cưng</h3>
                    <p>Bảo hiểm toàn diện cho ${pet.name}</p>
                    <div class="insurance-details">
                        <div class="insurance-detail">
                            <strong>Số hợp đồng</strong>
                            <p>BH-${pet.id.toString().padStart(6, '0')}</p>
                        </div>
                        <div class="insurance-detail">
                            <strong>Ngày hiệu lực</strong>
                            <p>${new Date().toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div class="insurance-detail">
                            <strong>Trạng thái</strong>
                            <p style="color: var(--success);">Đang hoạt động</p>
                        </div>
                    </div>
                </div>

                <div class="vaccine-section">
                    <h3>💉 Lịch sử tiêm phòng</h3>
                    <div class="vaccine-list">
                        ${pet.vaccines && pet.vaccines.length > 0 ? 
                            pet.vaccines.map(vaccine => `
                                <div class="vaccine-item">
                                    <div class="vaccine-info">
                                        <h4>${vaccine.name}</h4>
                                        <p class="vaccine-date">${new Date(vaccine.date).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <span class="vaccine-status status-completed">Đã tiêm</span>
                                </div>
                            `).join('') : 
                            '<p>Chưa có lịch sử tiêm phòng</p>'
                        }
                    </div>
                </div>

                <div class="health-records mt-3">
                    <h3>📊 Hồ sơ sức khỏe</h3>
                    <div class="pet-stats">
                        <div class="stat-item">
                            <span>Cân nặng:</span>
                            <strong>${pet.weight} kg</strong>
                        </div>
                        <div class="stat-item">
                            <span>Giới tính:</span>
                            <strong>${pet.gender}</strong>
                        </div>
                        <div class="stat-item">
                            <span>Tình trạng sức khỏe:</span>
                            <strong style="color: var(--success);">Tốt</strong>
                        </div>
                        <div class="stat-item">
                            <span>Ngày tham gia:</span>
                            <strong>${new Date(pet.join_date).toLocaleDateString('vi-VN')}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div id="food-calculation-tab" class="tab-content">
                <!-- Food calculation content will be loaded here -->
            </div>
        </div>
    `;

    document.querySelectorAll('.pet-detail-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchPetDetailTab(tab, petId);
        });
    });
}

function switchPetDetailTab(tab, petId) {
    document.querySelectorAll('.pet-detail-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.pet-details .tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');

    if (tab === 'food-calculation') {
        showFoodCalculation(petId);
    }
}

function handleAddPet(form) {
    if (!state.currentUser) {
        showMessage('Vui lòng đăng nhập để thêm thú cưng!', 'error');
        openModal('login-modal');
        return;
    }

    const formData = new FormData(form);
    const petData = {
        userId: state.currentUser.id,
        name: formData.get('petName'),
        nickname: formData.get('petNickname'),
        type: formData.get('petType'),
        breed: formData.get('petBreed'),
        gender: formData.get('petGender'),
        age: parseInt(formData.get('petAge')),
        weight: parseFloat(formData.get('petWeight'))
    };

    fetch('/api/pets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error, 'error');
        } else {
            showMessage(data.message, 'success');
            closeModal('add-pet-modal');
            form.reset();
            loadPetProfiles();
            addPoints(50);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Lỗi kết nối server!', 'error');
    });
}

// Cart System
function initCart() {
    // Will load from API when needed
}

function loadCart() {
    if (!state.currentUser) {
        const cartContainer = document.getElementById('cart-container');
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="text-center">
                    <div class="pet-avatar">🛒</div>
                    <h3>Vui lòng đăng nhập</h3>
                    <p>Đăng nhập để xem giỏ hàng của bạn</p>
                    <button class="btn btn-primary" onclick="openModal('login-modal')">Đăng nhập</button>
                </div>
            `;
        }
        return;
    }

    // SELLER KHÔNG CÓ GIỎ HÀNG
    if (state.currentUser.role === 'seller') {
        const cartContainer = document.getElementById('cart-container');
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="text-center">
                    <div class="pet-avatar">🏪</div>
                    <h3>Tài khoản Seller</h3>
                    <p>Tài khoản seller không thể mua hàng. Vui lòng sử dụng tài khoản khách hàng để mua sắm.</p>
                    <a href="#marketplace" class="btn btn-outline mt-2">Xem sản phẩm</a>
                </div>
            `;
        }
        return;
    }

    fetch(`/api/cart/${state.currentUser.id}`)
    .then(response => response.json())
    .then(cartItems => {
        state.cartItems = cartItems;
        renderCart();
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Lỗi tải giỏ hàng!', 'error');
    });
}

function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const cartCount = document.getElementById('cart-count');
    
    if (cartCount) {
        const totalKg = state.cartItems.reduce((sum, item) => sum + item.quantity_kg, 0);
        cartCount.textContent = Math.round(totalKg * 10) / 10;
        cartCount.style.display = totalKg > 0 ? 'flex' : 'none';
    }

    if (!cartContainer) return;

    if (state.cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <div class="pet-avatar">🛒</div>
                <h3>Giỏ hàng trống</h3>
                <p>Hãy thêm sản phẩm vào giỏ hàng của bạn!</p>
                <a href="#marketplace" class="btn btn-primary mt-2">Mua sắm ngay</a>
            </div>
        `;
        return;
    }

    const totalAmount = state.cartItems.reduce((sum, item) => {
        const price = item.product_price || 0;
        return sum + (price * item.quantity_kg);
    }, 0);

    cartContainer.innerHTML = `
        <div class="cart-items-grid">
            ${state.cartItems.map(item => {
                const itemTotal = (item.product_price * item.quantity_kg);
                return `
                <div class="cart-item-card">
                    <div class="cart-item-image-container">
                        <img src="${item.product_image}" alt="${item.product_name}" 
                             class="cart-item-image"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.product_name}</h4>
                        ${item.metadata && item.metadata.calculationDetails ? 
                            `<p class="cart-item-details">${item.metadata.calculationDetails}</p>` : ''}
                        <p class="cart-item-price">${formatPrice(item.product_price)}/kg</p>
                        <p class="cart-item-price">${formatPrice(itemTotal)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="btn btn-small" onclick="updateCartItem(${item.id}, ${Math.max(0.1, (item.quantity_kg - 0.5).toFixed(1))})">-0.5</button>
                        <span>${item.quantity_kg} kg</span>
                        <button class="btn btn-small" onclick="updateCartItem(${item.id}, ${(item.quantity_kg + 0.5).toFixed(1)})">+0.5</button>
                    </div>
                    <div class="cart-item-actions">
                        <button class="btn btn-small btn-outline" onclick="removeCartItem(${item.id})" style="width: 100%;">Xóa</button>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
        <div class="cart-summary">
            <div class="cart-total">
                <h3>Tổng cộng: ${formatPrice(totalAmount)}</h3>
                <p>Tổng khối lượng: ${state.cartItems.reduce((sum, item) => sum + item.quantity_kg, 0).toFixed(1)} kg</p>
                <p>Số lượng sản phẩm: ${state.cartItems.length}</p>
            </div>
            <div class="cart-actions">
                <button class="btn btn-primary" onclick="checkout()">Thanh toán</button>
                <button class="btn btn-outline" onclick="clearCart()">Xóa giỏ hàng</button>
                <a href="#marketplace" class="btn btn-outline">Tiếp tục mua sắm</a>
            </div>
        </div>
    `;
}

function addToCart(productId, quantityKg = 1.0, options = {}) {
    if (!state.currentUser) {
        showMessage('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', 'error');
        openModal('login-modal');
        return;
    }

    // KIỂM TRA ROLE - SELLER KHÔNG THỂ THÊM VÀO GIỎ HÀNG
    if (state.currentUser.role === 'seller') {
        showMessage('Tài khoản seller không thể mua hàng! Vui lòng sử dụng tài khoản khách hàng.', 'error');
        return;
    }

    if (state.products[productId]) {
        addToCartDirect(productId, quantityKg, options);
    } else {
        fetch(`/api/products/${productId}`)
            .then(response => {
                if (!response.ok) throw new Error('Product not found');
                return response.json();
            })
            .then(product => {
                state.products[productId] = product;
                addToCartDirect(productId, quantityKg, options);
            })
            .catch(error => {
                console.error('Error fetching product:', error);
                showMessage('Không thể tải thông tin sản phẩm!', 'error');
            });
    }
}

function addToCartDirect(productId, quantityKg = 1.0, options = {}) {
    const product = state.products[productId];
    if (!product) {
        showMessage('Sản phẩm không tồn tại!', 'error');
        return;
    }

    const productName = options.productName || `${product.brand} - ${product.name}`;
    const productPrice = options.productPrice || product.price;
    const productImage = product.image_url || product.image;

    fetch('/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: state.currentUser.id,
            productId: productId,
            productName: productName,
            productPrice: productPrice,
            productImage: productImage,
            quantityKg: quantityKg,
            metadata: options.metadata || {}
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || 'Network response was not ok');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showMessage(data.error, 'error');
        } else {
            showMessage(`
                ✅ Đã thêm vào giỏ hàng:<br> 
                <strong>${quantityKg} kg ${productName}</strong><br>
                Thành tiền: ${formatPrice(productPrice * quantityKg)}
            `, 'success');
            loadCart();
            addPoints(10);
        }
    })
    .catch(error => {
        console.error('Error adding to cart:', error);
        let errorMessage = 'Lỗi thêm vào giỏ hàng! Vui lòng thử lại.';
        try {
            const errorData = JSON.parse(error.message);
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            if (error.message) {
                errorMessage = error.message;
            }
        }
        showMessage(errorMessage, 'error');
    });
}

function updateCartItem(itemId, newQuantityKg) {
    if (newQuantityKg < 0.1) {
        removeCartItem(itemId);
        return;
    }

    fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantityKg: newQuantityKg }),
    })
    .then(response => response.json())
    .then(data => {
        showMessage(data.message, 'success');
        loadCart();
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Lỗi cập nhật giỏ hàng!', 'error');
    });
}

function removeCartItem(itemId) {
    fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        showMessage(data.message, 'success');
        loadCart();
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Lỗi xóa sản phẩm!', 'error');
    });
}

function clearCart() {
    if (!state.currentUser) return;

    fetch(`/api/cart/clear/${state.currentUser.id}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        showMessage('Đã xóa giỏ hàng!', 'success');
        state.cartItems = [];
        renderCart();
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Lỗi xóa giỏ hàng!', 'error');
    });
}

function calculateCartTotal() {
    return state.cartItems.reduce((sum, item) => {
        return sum + (item.product_price * item.quantity_kg);
    }, 0);
}

// Marketplace System
function initMarketplace() {
    document.addEventListener('click', function(e) {
        if (e.target.matches('.tab-btn')) {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        }
    });

    state.products = {};
    state.services = {
        'grooming': {
            id: 'grooming',
            name: 'Dịch vụ Grooming',
            price: '200.000đ - 500.000đ',
            description: 'Dịch vụ chăm sóc và làm đẹp cho thú cưng',
            duration: '2-3 giờ',
            category: 'care'
        },
        'veterinary': {
            id: 'veterinary',
            name: 'Khám bệnh',
            price: '150.000đ - 300.000đ',
            description: 'Khám sức khỏe định kỳ và điều trị bệnh',
            duration: '30-60 phút',
            category: 'health'
        },
        'boarding': {
            id: 'boarding',
            name: 'Trông giữ',
            price: '100.000đ/ngày',
            description: 'Dịch vụ trông giữ thú cưng khi bạn vắng nhà',
            duration: 'Theo ngày',
            category: 'care'
        }
    };
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
}

function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    fetch('/api/products?type=food')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch products');
            return response.json();
        })
        .then(products => {
            productsGrid.innerHTML = '';
            
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                // KIỂM TRA ROLE ĐỂ HIỂN THỊ NÚT PHÙ HỢP
                let actionButtons = '';
                if (state.currentUser && state.currentUser.role === 'seller') {
                    actionButtons = `
                        <button class="btn btn-outline" disabled>
                            🏪 Chỉ dành cho khách hàng
                        </button>
                    `;
                } else {
                    actionButtons = `
                        <button class="btn btn-primary" 
                                onclick="addToCart(${product.id})"
                                ${!product.in_stock ? 'disabled' : ''}>
                            ${product.in_stock ? 'Thêm vào giỏ' : 'Hết hàng'}
                        </button>
                        ${product.kcal_per_kg ? `
                            <button class="btn btn-outline btn-small mt-1" 
                                    onclick="useForCalculation(${product.id})">
                                🧮 Dùng để tính toán
                            </button>
                        ` : ''}
                    `;
                }
                
                productCard.innerHTML = `
                    <div class="product-badge">${product.in_stock ? 'Còn hàng' : 'Hết hàng'}</div>
                    <div class="product-image-container">
                        <img src="${product.image_url || '/images/products/default-food.png'}" 
                             alt="${product.name}" 
                             class="product-image"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIyMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                    </div>
                    <h3>${product.name}</h3>
                    <p class="description">${product.description || 'Thức ăn chất lượng cao cho thú cưng'}</p>
                    <div class="price">${formatPrice(product.price)}</div>
                    <div class="product-meta">
                        <small>Thương hiệu: ${product.brand || 'Không rõ'}</small>
                        ${product.kcal_per_kg ? `<small>Năng lượng: ${product.kcal_per_kg} kcal/kg</small>` : ''}
                    </div>
                    ${actionButtons}
                `;
                productsGrid.appendChild(productCard);
            });

            state.products = products.reduce((acc, product) => {
                acc[product.id] = product;
                return acc;
            }, {});
        })
        .catch(error => {
            console.error('Error loading products:', error);
            productsGrid.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1;">
                    <p>Lỗi tải sản phẩm: ${error.message}</p>
                    <button class="btn btn-primary" onclick="loadProducts()">Thử lại</button>
                </div>
            `;
        });
}

function useForCalculation(productId) {
    if (!state.products[productId]) {
        fetch(`/api/products/${productId}`)
            .then(response => {
                if (!response.ok) throw new Error('Product not found');
                return response.json();
            })
            .then(product => {
                state.products[productId] = product;
                navigateToFoodCalculation(productId);
            })
            .catch(error => {
                console.error('Error fetching product:', error);
                showMessage('Không thể tải thông tin sản phẩm!', 'error');
            });
    } else {
        navigateToFoodCalculation(productId);
    }
}

function navigateToFoodCalculation(productId) {
    const product = state.products[productId];
    if (!product || !product.kcal_per_kg) {
        showMessage('Sản phẩm này không thể dùng để tính toán thức ăn!', 'error');
        return;
    }

    navigateTo('pet-profile');
    
    setTimeout(() => {
        const petDetailTabs = document.querySelector('.pet-detail-tabs');
        if (petDetailTabs) {
            const calculationTab = petDetailTabs.querySelector('[data-tab="food-calculation"]');
            if (calculationTab) {
                calculationTab.click();
                
                setTimeout(() => {
                    const foodSelect = document.getElementById('food-select');
                    if (foodSelect) {
                        foodSelect.value = productId;
                        const event = new Event('change');
                        foodSelect.dispatchEvent(event);
                    }
                }, 500);
            }
        }
    }, 1000);
}

function loadServices() {
    const servicesGrid = document.getElementById('services-grid');
    if (!servicesGrid) return;

    servicesGrid.innerHTML = '';
    
    Object.values(state.services).forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        
        // KIỂM TRA ROLE ĐỂ HIỂN THỊ NÚT PHÙ HỢP
        let actionButton = '';
        if (state.currentUser && state.currentUser.role === 'seller') {
            actionButton = `
                <button class="btn btn-outline" disabled>
                    🏪 Chỉ dành cho khách hàng
                </button>
            `;
        } else {
            actionButton = `
                <button class="btn btn-primary" onclick="bookService('${service.id}')">Đặt lịch ngay</button>
            `;
        }
        
        serviceCard.innerHTML = `
            <div class="service-icon">🏥</div>
            <h4>${service.name}</h4>
            <p>${service.description}</p>
            <div class="price">${service.price}</div>
            <p><small>Thời gian: ${service.duration}</small></p>
            ${actionButton}
        `;
        servicesGrid.appendChild(serviceCard);
    });
}

function bookService(serviceId) {
    if (!state.currentUser) {
        showMessage('Vui lòng đăng nhập để đặt dịch vụ!', 'error');
        openModal('login-modal');
        return;
    }

    // KIỂM TRA ROLE - SELLER KHÔNG THỂ ĐẶT DỊCH VỤ
    if (state.currentUser.role === 'seller') {
        showMessage('Tài khoản seller không thể đặt dịch vụ!', 'error');
        return;
    }

    const service = state.services[serviceId];
    if (service) {
        showMessage(`Đã đặt lịch ${service.name} thành công!`, 'success');
        addPoints(20);
    }
}

// AI Assistant System
function initAIAssistant() {}

function initChat() {
    const sendBtn = document.getElementById('send-message');
    const chatInput = document.getElementById('chat-input');
    
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        addChatMessage(aiResponse, 'bot');
    }, 1000);
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    // === PHẢN HỒI MẶC ĐỊNH VỚI GỢI ý CỤ THỂ ===
    if (isShortMessage(lowerMessage)) {
        return getDefaultResponseWithSuggestions();
    }

    // === PHÂN LOẠI CHÍNH BẰNG SWITCH-CASE ===
    switch (true) {
        case isNutritionRelated(lowerMessage):
            return handleNutrition(lowerMessage);
            
        case isHealthRelated(lowerMessage):
            return handleHealth(lowerMessage);
            
        case isSkinRelated(lowerMessage):
            return handleSkinIssues(lowerMessage);
            
        case isBehaviorRelated(lowerMessage):
            return handleBehaviorIssues(lowerMessage);
            
        case isCareRelated(lowerMessage):
            return handleBasicCare(lowerMessage);
            
        case isEmergencyRelated(lowerMessage):
            return handleEmergency(lowerMessage);
            
        case isVaccinationRelated(lowerMessage):
            return handleVaccination(lowerMessage);
            
        default:
            return getDetailedDefaultResponse(lowerMessage);
    }
}

// === HÀM KIỂM TRA PHÂN LOẠI ===
function isShortMessage(message) {
    const shortMessages = ['hi', 'hello', 'chào', 'xin chào', 'hey', 'cún', 'mèo', ''];
    return shortMessages.includes(message) || message.length < 3;
}

function isNutritionRelated(message) {
    const keywords = ['thức ăn', 'dinh dưỡng', 'ăn gì', 'cho ăn', 'khẩu phần', 'đồ ăn', 'món ăn', 'sữa', 'bú'];
    return keywords.some(keyword => message.includes(keyword));
}

function isHealthRelated(message) {
    const symptoms = ['bệnh', 'ốm', 'sức khỏe', 'triệu chứng', 'sốt', 'nôn', 'ói', 'tiêu chảy', 'ỉa chảy', 
                     'bỏ ăn', 'ho', 'khó thở', 'thở gấp', 'táo bón', 'đi ngoài', 'tiểu', 'đái', 'mắt', 'tai', 'mũi'];
    return symptoms.some(symptom => message.includes(symptom));
}

function isSkinRelated(message) {
    const keywords = ['da', 'lông', 'ngứa', 'ghẻ', 'rụng lông', 'dị ứng', 'mẩn đỏ', 'vảy', 'hói', 'bọ chét', 've'];
    return keywords.some(keyword => message.includes(keyword));
}

function isBehaviorRelated(message) {
    const keywords = ['cắn', 'sủa', 'gầm gừ', 'hung dữ', 'stress', 'lo lắng', 'sợ hãi', 'cào', 'phá', 'bậy', 'đi vệ sinh'];
    return keywords.some(keyword => message.includes(keyword));
}

function isCareRelated(message) {
    const keywords = ['tắm', 'vệ sinh', 'chăm sóc', 'cắt móng', 'đánh răng', 'chải lông', 'vệ sinh răng', 'tắm rửa'];
    return keywords.some(keyword => message.includes(keyword));
}

function isEmergencyRelated(message) {
    const keywords = ['cấp cứu', 'khẩn cấp', 'nguy hiểm', 'chảy máu', 'gãy xương', 'co giật', 'hôn mê', 'thở gấp', 'bất tỉnh'];
    return keywords.some(keyword => message.includes(keyword));
}

function isVaccinationRelated(message) {
    const keywords = ['tiêm', 'vaccine', 'phòng bệnh', 'tiêm phòng', 'chủng ngừa', 'tẩy giun'];
    return keywords.some(keyword => message.includes(keyword));
}

// === PHẢN HỒI MẶC ĐỊNH VỚI GỢI Ý CHI TIẾT ===
function getDefaultResponseWithSuggestions() {
    const responses = [
        `🐾 **CHÀO MỪNG ĐẾN VỚI TRỢ LÝ SỨC KHỎE THÚ CƯNG!** 🐾

Tôi có thể giúp bạn với các vấn đề sau:

**🤒 VỀ SỨC KHỎE - hãy nói về:**
• "Sốt", "Nôn", "Tiêu chảy", "Bỏ ăn"
• "Ho", "Khó thở", "Thở gấp" 
• "Mắt đỏ", "Tai có mùi", "Chảy nước mũi"
• "Tiểu khó", "Táo bón", "Đi ngoài ra máu"

**🍖 VỀ DINH DƯỠNG - hãy hỏi:**
• "Thức ăn cho chó con/mèo con"
• "Chó lớn ăn gì?", "Mèo già ăn gì?"
• "Khẩu phần cho chó 5kg", "Mèo 4kg ăn bao nhiêu?"

**🧴 VỀ DA & LÔNG - hãy mô tả:**
• "Ngứa", "Rụng lông", "Ghẻ", "Dị ứng"
• "Bọ chét", "Ve", "Nổi mẩn đỏ"

**😟 VỀ HÀNH VI - hãy kể:**
• "Cắn người", "Sủa nhiều", "Cào đồ"
• "Stress", "Đi vệ sinh bậy", "Hung dữ"

Hãy cho tôi biết vấn đề cụ thể!`,

        `🏥 **TÔI CÓ THỂ TƯ VẤN CHI TIẾT VỀ:** 🏥

**CÁC TRIỆU CHỨNG THƯỜNG GẶP:**
📍 "Sốt" - nhiệt độ, cách hạ sốt
📍 "Nôn" - phân loại nôn, xử lý tại nhà  
📍 "Tiêu chảy" - nguyên nhân, điều trị
📍 "Bỏ ăn" - biện pháp kích thích ăn
📍 "Ho" - các loại ho, khi nào nguy hiểm

**THEO ĐỘ TUỔI:**
🐕 Chó con (0-1 tuổi) - Chó trưởng thành (1-7 tuổi) - Chó già (7+ tuổi)
🐈 Mèo con (0-1 tuổi) - Mèo trưởng thành (1-7 tuổi) - Mèo già (7+ tuổi)

**THEO GIỐNG:**
• Chó nhỏ (Poodle, Chihuahua) • Chó lớn (Husky, Golden)
• Mèo Ba Tư • Mèo Xiêm • Mèo ta

Hãy nói "chó bị sốt" hoặc "mèo bỏ ăn" để được tư vấn chi tiết!`,

        `💡 **GỢI Ý CÁCH HỎI ĐỂ ĐƯỢC TƯ VẤN TỐT NHẤT:** 💡

Ví dụ về sức khỏe:
• "Chó của tôi bị nôn và tiêu chảy"
• "Mèo bỏ ăn 2 ngày rồi"
• "Cún bị sốt 40 độ"
• "Mèo đi tiểu ra máu"

Ví dụ về dinh dưỡng:
• "Thức ăn cho chó con 2 tháng tuổi"
• "Mèo 5kg ăn bao nhiêu là đủ?"
• "Chó già 10 tuổi nên ăn gì?"

Ví dụ về chăm sóc:
• "Cách tắm cho chó"
• "Đánh răng cho mèo thế nào?"
• "Bao lâu cắt móng một lần?"

Hãy cho biết: LOÀI + TRIỆU CHỨNG + ĐỘ TUỔI (nếu có)!`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function getDetailedDefaultResponse(message) {
    // Nếu có mention đến chó/mèo nhưng không rõ vấn đề
    if (message.includes('chó') || message.includes('cún')) {
        return `🐕 Bạn đang nói về chó phải không? Hãy cho tôi biết cụ thể:
• "Chó bị sốt" - để biết nhiệt độ nguy hiểm
• "Chó nôn ra bọt vàng" - phân loại nôn  
• "Chó tiêu chảy" - nguyên nhân và xử lý
• "Chó bỏ ăn" - biện pháp kích thích ăn
• Hoặc bất kỳ triệu chứng nào khác!`;
    }
    
    if (message.includes('mèo') || message.includes('mèo')) {
        return `🐈 Bạn đang nói về mèo phải không? Hãy cho tôi biết cụ thể:
• "Mèo bị nôn" - đặc biệt nôn búi lông
• "Mèo tiểu khó" - bệnh nguy hiểm cần cấp cứu
• "Mèo bỏ ăn" - mèo nhịn ăn rất nguy hiểm
• "Mèo búi lông" - cách phòng và trị
• Hoặc triệu chứng nào khác bạn quan sát thấy!`;
    }
    
    return `Hãy thử các cách hỏi sau:

**VỀ BỆNH:**
• "Sốt" • "Nôn" • "Tiêu chảy" • "Bỏ ăn" • "Ho"
• "Khó thở" • "Đi tiểu khó" • "Táo bón"

**VỀ DINH DƯỠNG:**
• "Thức ăn cho [chó/mèo] [tuổi]"
• "[Chó/Mèo] [cân nặng] ăn bao nhiêu?"

**VỀ CHĂM SÓC:**
• "Cách tắm" • "Đánh răng" • "Cắt móng"

Hãy cho tôi biết loại thú cưng và vấn đề cụ thể!`;
}

// === XỬ LÝ DINH DƯỠNG ===
function handleNutrition(message) {
    const isDog = message.includes('chó') || message.includes('cún');
    const isCat = message.includes('mèo') || message.includes('mèo');
    
    if (isDog) return handleDogNutrition(message);
    if (isCat) return handleCatNutrition(message);
    
    return `🍖 **BẠN MUỐN TƯ VẤN DINH DƯỠNG CHO:** 🍖
• "Chó" - hay "Cún" 
• "Mèo" - hay "Mèo"

Hãy cho biết loại thú cưng để tôi tư vấn chi tiết về:
• Thức ăn theo độ tuổi • Khẩu phần theo cân nặng
• Thành phần dinh dưỡng • Thức ăn đặc biệt theo giống`;
}

function handleDogNutrition(message) {
    switch (true) {
        case message.includes('con') || message.includes('nhỏ'):
            return getDogPuppyNutrition();
        case message.includes('già') || message.includes('lão'):
            return getDogSeniorNutrition();
        case message.includes('lớn') || message.includes('trưởng thành'):
            return getDogAdultNutrition();
        default:
            return getDogGeneralNutrition();
    }
}


function handleCatNutrition(message) {
    switch (true) {
        case message.includes('con') || message.includes('nhỏ'):
            return getCatKittenNutrition();
        case message.includes('già') || message.includes('lão'):
            return getCatSeniorNutrition();
        case message.includes('lớn') || message.includes('trưởng thành'):
            return getCatAdultNutrition();
        default:
            return getCatGeneralNutrition();
    }
}

// === XỬ LÝ SỨC KHỎE ===
function handleHealth(message) {
    const isDog = message.includes('chó') || message.includes('cún');
    const isCat = message.includes('mèo') || message.includes('mèo');
    
    // Xử lý các triệu chứng cụ thể
    switch (true) {
        case message.includes('sốt'):
            return handleFever(message, isDog, isCat);
        case message.includes('nôn') || message.includes('ói'):
            return handleVomiting(message, isDog, isCat);
        case message.includes('tiêu chảy') || message.includes('ỉa chảy'):
            return handleDiarrhea(message, isDog, isCat);
        case message.includes('bỏ ăn'):
            return handleLossOfAppetite(message, isDog, isCat);
        case message.includes('ho'):
            return handleCoughing(message, isDog, isCat);
        case message.includes('khó thở') || message.includes('thở gấp'):
            return handleBreathingProblems(message, isDog, isCat);
        default:
            if (isDog) return getDogGeneralHealthAdvice();
            if (isCat) return getCatGeneralHealthAdvice();
            return getGeneralHealthAdvice();
    }
}

// === CÁC HÀM CHI TIẾT CHO TỪNG TRIỆU CHỨNG ===
function handleFever(message, isDog, isCat) {
    if (isDog) {
        return `🌡️ **SỐT Ở CHÓ - CHI TIẾT:** 🌡️

    **NHIỆT ĐỘ BÌNH THƯỜNG:** 38.0 - 39.0°C
    **SỐT NHẸ:** 39.1 - 39.4°C
    **SỐT CAO:** 39.5 - 40.5°C  
    **SỐT RẤT CAO (CẤP CỨU):** Trên 40.5°C

    **DẤU HIỆU NHẬN BIẾT:**
    • Mũi khô, nóng • Thở nhanh, hổn hển
    • Run rẩy • Lờ đờ, bỏ ăn
    • Mắt đỏ • Nướu đỏ sẫm

    **XỬ LÝ TẠI NHÀ:**
    • Cho uống nước mát • Chườm mát vùng bẹn, nách
    • Để nơi thoáng mát • Theo dõi nhiệt độ 2h/lần

    **CẦN BÁC SĨ KHI:**
    • Sốt > 40°C • Kèm nôn/tiêu chảy
    • Co giật • Bỏ ăn > 24h

    Hãy cho tôi biết nhiệt độ cụ thể nếu bạn đã đo!`;
        }
        
        if (isCat) {
            return `🌡️ **SỐT Ở MÈO - CHI TIẾT:** 🌡️

    **NHIỆT ĐỘ BÌNH THƯỜNG:** 38.0 - 39.2°C
    **SỐT NHẸ:** 39.3 - 39.7°C  
    **SỐT CAO:** 39.8 - 40.5°C
    **SỐT RẤT CAO (CẤP CỨU):** Trên 40.5°C

    **DẤU HIỆU ĐẶC TRƯNG Ở MÈO:**
    • Tìm chỗ mát nằm • Thở hổn hển (hiếm khi)
    • Bỏ ăn hoàn toàn • Lờ đờ, ít vận động
    • Lông dựng đứng • Mắt third eyelid lộ rõ

    **XỬ LÝ:**
    • Nước mát luôn sẵn • Quạt nhẹ thoáng mát
    • Khăn ẩm lau người • Không ép ăn

    **CẤP CỨU NGAY KHI:**
    • Sốt > 40.5°C • Mèo bất tỉnh
    • Thở khó khăn • Co giật

    Mèo sốt rất nguy hiểm, nên đi khám sớm!`;
    }
    
    return getGeneralFeverAdvice();
}

// === XỬ LÝ NÔN MỬA CHI TIẾT ===
function handleVomiting(message, isDog, isCat) {
    if (isDog) {
        return `🤢 **NÔN Ở CHÓ - CHẨN ĐOÁN CHI TIẾT:** 🤢

    **PHÂN LOẠI NÔN & Ý NGHĨA:**
    • 🟡 Nôn khan + ho = Hội chứng ho cũi
    • ⚪ Nôn bọt trắng = Dịch vị (viêm dạ dày)  
    • 🟡 Nôn bọt vàng = Dịch mật (viêm tá tràng)
    • 🔴 Nôn ra máu đỏ tươi = Xuất huyết dạ dày
    • 🔴 Nôn ra máu nâu = Xuất huyết tiêu hóa trên
    • 🔴 Nôn ra phân = Tắc ruột (CẤP CỨU)

    **NGUYÊN NHÂN THEO ĐỘ TUỔI:**
    🐕 **CHÓ CON (dưới 1 tuổi):**
    • Nuốt dị vật • Giun sán • Parvovirus
    • Ngộ độc • Thay đổi thức ăn đột ngột

    🐕 **CHÓ TRƯỞNG THÀNH (1-7 tuổi):**
    • Viêm tụy • Viêm dạ dày • Ngộ độc
    • Bệnh gan/thận • Dị ứng thức ăn

    🐕 **CHÓ GIÀ (trên 7 tuổi):**
    • Ung thư • Suy thận • Bệnh gan mãn
    • Khối u đường tiêu hóa

    **XỬ LÝ TẠI NHÀ - 4 BƯỚC:**
    1️⃣ **Ngừng cho ăn** 4-6 giờ (vẫn cho uống nước)
    2️⃣ **Bù nước**: Nước điện giải pha loãng, cho uống từng ngụm nhỏ
    3️⃣ **Thức ăn nhẹ**: Cơm trắng + thịt gà luộc (không da) + bí đỏ nghiền
    4️⃣ **Chia nhỏ bữa**: 4-6 bữa/ngày, mỗi bữa ít một

    **THUỐC/DỤNG CỤ CẦN THIẾT:**
    • Men vi sinh cho chó • Nước điện giải
    • Syringe bơm nước • Thức ăn hạt nhỏ, dễ tiêu

    **🚨 CẦN BÁC SĨ NGAY KHI:**
    • Nôn > 3 lần/giờ • Nôn ra máu
    • Bụng chướng cứng • Li bì, sốt cao
    • Không uống được nước • Chó con dưới 6 tháng

    **Hãy cho tôi biết thêm:**
    • Màu sắc chất nôn? • Tần suất nôn?
    • Có kèm tiêu chảy không? • Chó có uống nước được không?`;
        }
        
        if (isCat) {
            return `🤢 **NÔN Ở MÈO - CHẨN ĐOÁN CHI TIẾT:** 🤢

    **PHÂN LOẠI ĐẶC TRƯNG Ở MÈO:**
    • 🟢 Nôn búi lông = Bình thường (1-2 lần/tuần)
    • 🟡 Nôn ngay sau ăn = Nuốt nhanh, dị ứng thức ăn
    • 🟡 Nôn dịch vàng = Viêm dạ dày ruột
    • 🔴 Nôn ra máu = Viêm loét dạ dày
    • 🔴 Nôn kèm tiêu chảy = Nhiễm trùng nặng

    **NGUYÊN NHÂN PHỔ BIẾN:**
    🐈 **MÈO TRONG NHÀ:**
    • Búi lông • Nuốt dị vật (dây, nhựa)
    • Thay đổi thức ăn • Căng thẳng

    🐈 **MÈO MỌI LỨA TUỔI:**
    • Bệnh thận • Cường giáp • Viêm tụy
    • Tiểu đường • Bệnh gan

    **XỬ LÝ TẠI NHÀ CHO MÈO:**
    1️⃣ **Malt paste**: 2-3cm/ngày để tống lông
    2️⃣ **Thức ăn nhạy cảm**: Hạt nhỏ, dễ tiêu hóa
    3️⃣ **Chia bữa nhỏ**: 4-6 bữa/ngày, mỗi bữa ít
    4️⃣ **Nước sạch**: Luôn có sẵn, thay 2 lần/ngày

    **THỨC ĂN ĐẶC BIỆT:**
    • Pate dễ tiêu • Thịt gà xay nhuyễn
    • Cá hồi hấp • Tránh thức ăn lạ

    **🚨 CẤP CỨU MÈO KHI:**
    • Nôn > 4 lần/ngày • Nôn ra máu
    • Bỏ ăn > 24 giờ • Li bì, yếu ớt
    • Kèm tiêu chảy nặng • Không uống nước

    **LƯU Ý QUAN TRỌNG:**
    Mèo nhịn ăn quá 48h có thể bị lipidosis gan - TỬ VONG CAO!

    **Hãy cho tôi biết:**
    • Mèo có nôn búi lông không? • Đã bỏ ăn bao lâu?
    • Có tiêu chảy không? • Màu sắc chất nôn?`;
        }
        
        return `🤢 **NÔN Ở THÚ CƯNG - THÔNG TIN CHUNG:** 🤢

    Hãy cho biết là "chó bị nôn" hay "mèo bị nôn" để được tư vấn chi tiết!

    **XỬ LÝ CHUNG:**
    • Ngừng cho ăn 4-6h • Cho uống nước từng ít một
    • Theo dõi sát • Đến bác sĩ nếu nặng

    **CẦN BÁC SĨ KHI:**
    • Nôn nhiều lần • Nôn ra máu
    • Bỏ ăn, li bì • Kèm các triệu chứng khác`;
}

// === DINH DƯỠNG CHÓ CON CHI TIẾT ===
function getDogPuppyNutrition() {
    return `🐶 **DINH DƯỠNG CHÓ CON (0-12 THÁNG) - HƯỚNG DẪN CHI TIẾT** 🐶

    **📅 LỊCH ĂN THEO TỪNG GIAI ĐOẠN:**

    🍼 **0-3 TUẦN (SƠ SINH):**
    • Hoàn toàn bú sữa mẹ
    • Nếu mất mẹ: Sữa thay thế chuyên dụng
    • Cứ 2-3 giờ cho bú 1 lần
    • Khối lượng: 15-30ml/lần tùy giống

    🥣 **3-8 TUẦN (CAI SỮA):**
    • Sữa + thức ăn khô ngâm mềm
    • 4-6 bữa/ngày • Lượng: 30-50g/kg cân nặng
    • Thức ăn: Loại dành riêng cho chó con

    🍚 **2-4 THÁNG (PHÁT TRIỂN NHANH):**
    • 4 bữa/ngày • Lượng: 50-75g/kg cân nặng
    • Protein: 28-32% • Chất béo: 15-20%
    • Thức ăn khô cỡ nhỏ, dễ nhai

    🍗 **4-6 THÁNG (TĂNG TRƯỞNG):**
    • 3 bữa/ngày • Lượng: 60-80g/kg cân nặng
    • Tăng đạm chất lượng cao • Bổ sung DHA

    🥩 **6-12 THÁNG (HOÀN THIỆN):**
    • 2-3 bữa/ngày • Lượng: 50-70g/kg cân nặng
    • Chuyển dần sang thức ăn trưởng thành

    **📊 THÀNH PHẦN DINH DƯỠNG LÝ TƯỞNG:**

    ⚖️ **TỶ LỆ CHUẨN:**
    • Protein: 28-32% (thịt gà, cá, bò)
    • Chất béo: 15-20% (dầu cá, mỡ gà)
    • Canxi: 1-1.8% • Phospho: 0.8-1.6%
    • Tỷ lệ Ca:P = 1.2:1 (QUAN TRỌNG)
    • DHA: 0.05-0.1% cho não bộ

    🔥 **NĂNG LƯỢNG:**
    • 200-300 kcal/kg cân nặng/ngày
    • Tùy mức độ vận động

    **🐕 THEO GIỐNG CHÓ:**

    🔸 **GIỐNG NHỎ (Poodle, Chihuahua, Phốc):**
    • Cần nhiều calo hơn (tỷ lệ trao đổi chất cao)
    • Thức ăn hạt siêu nhỏ • Dễ bị hạ đường huyết
    • Nên chia 4-5 bữa/ngày

    🔸 **GIỐNG VỪA (Corgi, Beagle, Pug):**
    • Lượng thức ăn trung bình • Dễ béo phì
    • Kiểm soát cân nặng từ nhỏ

    🔸 **GIỐNG LỚN (Golden, Husky, Labrador):**
    • KIỂM SOÁT CANXI nghiêm ngặt
    • Tránh thừa canxi gây loạn sản xương hông
    • Thức ăn cho giống lớn, phát triển chậm

    🔸 **GIỐNG KHỔNG LỒ (Great Dane, Saint Bernard):**
    • Phát triển RẤT CHẬM • Ít calo, đủ dinh dưỡng
    • Thức ăn chuyên biệt cho giống khổng lồ

    **🍖 THỨC ĂN TỰ NHIÊN BỔ SUNG:**

    ✅ **THỰC PHẨM TỐT:**
    • Thịt gà luộc không da • Cá hồi/hồi hấp (2 lần/tuần)
    • Sữa chua không đường • Cà rốt luộc mềm
    • Bí đỏ nghiền • Trứng gà luộc chín

    ❌ **THỰC PHẨM CẤM:**
    • Socola • Hành, tỏi • Nho, nho khô
    • Xương nhọn • Đồ ngọt • Caffein

    **💧 NƯỚC UỐNG:**
    • Luôn có nước sạch • Thay 2-3 lần/ngày
    • Lượng nước: 50-100ml/kg/ngày

    **⚠️ DẤU HIỆU DINH DƯỠNG TỐT:**
    • Phân thành khuôn, màu nâu • Lông bóng mượt
    • Năng động, vui vẻ • Tăng cân đều đặn

    **🚨 DẤU HIỆU BẤT THƯỜNG:**
    • Tiêu chảy, nôn • Chậm lớn • Lông xơ xác
    • Còi cọc • Bụng to bất thường

    **Hãy cho tôi biết:**
    • Giống chó cụ thể? • Cân nặng hiện tại?
    • Đang dùng thức ăn gì? • Có vấn đề sức khỏe không?`;
}

// === DINH DƯỠNG MÈO CON CHI TIẾT ===
function getCatKittenNutrition() {
    return `🐱 **DINH DƯỠNG MÈO CON (0-12 THÁNG) - HƯỚNG DẪN CHI TIẾT** 🐱

    **📅 LỊCH ĂN THEO TUẦN TUỔI:**

    🍼 **0-4 TUẦN (BÚ MẸ HOÀN TOÀN):**
    • Sữa mẹ là tốt nhất • Cứ 2-3 giờ bú 1 lần
    • Nếu mất mẹ: Sữa thay thế chuyên dụng cho mèo
    • KHÔNG dùng sữa bò (gây tiêu chảy)

    🥛 **4-8 TUẦN (CAI SỮA):**
    • Sữa + pate/cháo thịt xay nhuyễn
    • 6-8 bữa/ngày • Lượng: 20-30g/kg cân nặng
    • Bắt đầu tập ăn thức ăn khô ngâm mềm

    🍖 **2-4 THÁNG (PHÁT TRIỂN NHANH):**
    • 4-6 bữa/ngày • Lượng: 30-40g/kg cân nặng
    • Thức ăn khô ngâm mềm hoặc hạt nhỏ
    • Protein: 30-40% • Chất béo: 18-25%

    🐟 **4-6 THÁNG (TĂNG TRƯỞNG MẠNH):**
    • 3-4 bữa/ngày • Lượng: 40-50g/kg cân nặng
    • Tăng đạm động vật • Bổ sung Taurine đầy đủ

    🍗 **6-12 THÁNG (HOÀN THIỆN):**
    • 2-3 bữa/ngày • Lượng: 50-60g/kg cân nặng
    • Chuyển dần sang thức ăn trưởng thành

    **📊 THÀNH PHẦN BẮT BUỘC CHO MÈO:**

    ⚖️ **DINH DƯỠNG TỐI THIỂU:**
    • Protein: 30-40% (thịt, cá, gia cầm)
    • Taurine: 500-750mg/kg thức ăn (BẮT BUỘC)
    • Chất béo: 18-25% (dầu cá, mỡ gà)
    • Arachidonic acid: 0.02% (có trong mỡ động vật)
    • Vitamin A: 5000-10000 IU/kg (mèo không tổng hợp được)
    • Vitamin D: 500-1000 IU/kg

    🔥 **NĂNG LƯỢNG:**
    • 200-250 kcal/kg cân nặng/ngày
    • Mèo con cần gấp 2-3 lần mèo trưởng thành

    **💧 TẦM QUAN TRỌNG CỦA NƯỚC:**
    • Mèo uống ít nước tự nhiên • Ưu tiên thức ăn ướt
    • Nước sạch luôn có sẵn • Nhiều bát nước ở các vị trí

    **🍲 TỶ LỆ THỨC ĂN ƯỚT/KHÔ LÝ TƯỞNG:**

    🥫 **MÈO CON DƯỚI 6 THÁNG:**
    • 70% ướt + 30% khô • Ưu tiên pate mềm
    • Thức ăn ướt cung cấp đủ nước

    🍚 **MÈO CON TRÊN 6 THÁNG:**
    • 60% ướt + 40% khô • Kết hợp đa dạng
    • Thức ăn khô giúp làm sạch răng

    **🐈 THEO GIỐNG MÈO:**

    🔸 **MÈO TA (DOMESTIC SHORTHAIR):**
    • Dễ tính, ăn uống đa dạng • Sức đề kháng tốt
    • Vẫn cần đủ Taurine và Vitamin A

    🔸 **MÈO BA TƯ (PERSIAN):**
    • Mặt phẳng, khó ăn • Cần hạt hình chữ V
    • Dễ bị búi lông • Cần bổ sung dầu

    🔸 **MÈO XIÊM (SIAMESE):**
    • Năng động, cần nhiều năng lượng
    • Nhu cầu đạm cao hơn • Dễ bị béo phì nếu ít vận động

    🔸 **MÈO LÔNG DÀI (MAINE COON, RAGDOLL):**
    • Cần bổ sung dầu để tránh búi lông
    • Thức ăn chuyên cho lông dài • Chải lông thường xuyên

    **🍖 THỨC ĂN TỰ NHIÊN BỔ SUNG:**

    ✅ **THỰC PHẨM TỐT:**
    • Thịt gà xay nhuyễn • Cá hồi/hồi hấp chín
    • Gan gà (1 lần/tuần) • Lòng đỏ trứng luộc
    • Sữa chuyên dụng cho mèo • Bí đỏ nghiền

    ❌ **THỰC PHẨM CẤM:**
    • Hành, tỏi • Socola • Caffein
    • Nho, nho khô • Đồ ngọt • Xương

    **🚨 DẤU HIỆU DINH DƯỠNG TỐT:**
    • Tăng cân đều • Lông bóng mượt
    • Mắt sáng • Năng động, tò mò
    • Phân thành khuôn

    **⚠️ DẤU HIỆU BẤT THƯỜNG:**
    • Chậm lớn • Tiêu chảy, nôn • Lông xơ xác
    • Mắt đục • Yếu ớt, ít vận động

    **🎯 LƯU Ý QUAN TRỌNG:**
    • Mèo là động vật ăn thịt bắt buộc
    • Cần đạm động vật chất lượng cao
    • Taurine là KHÔNG THỂ THIẾU
    • Thiếu Taurine gây mù lòa, bệnh tim

    **Hãy cho tôi biết:**
    • Giống mèo cụ thể? • Cân nặng hiện tại?
    • Đang ăn thức ăn gì? • Có vấn đề sức khỏe không?`;
    }

// === CÁC HÀM DINH DƯỠNG KHÁC ===
function getDogAdultNutrition() {
    return `🐕 **DINH DƯỠNG CHÓ TRƯỞNG THÀNH (1-7 TUỔI) - CHI TIẾT** 🐕

    **📊 LƯỢNG THỨC ĂN THEO CÂN NẶNG:**

    ⚖️ **THEO TRỌNG LƯỢNG CƠ THỂ:**
    • Dưới 5kg: 120-200g/ngày
    • 5-10kg: 200-300g/ngày  
    • 10-20kg: 300-450g/ngày
    • 20-35kg: 450-650g/ngày
    • Trên 35kg: 650-900g/ngày

    **🏃 THEO MỨC ĐỘ HOẠT ĐỘNG:**

    🚶 **ÍT VẬN ĐỘNG (Trong nhà, ít chơi):**
    • Giảm 10-20% lượng thức ăn
    • Thức ăn ít calo • Tăng chất xơ
    • Tránh đồ ăn vặt

    🏃 **HOẠT ĐỘNG TRUNG BÌNH (Đi dạo hàng ngày):**
    • Theo khuyến cáo trên bao bì
    • Cân bằng dinh dưỡng • Đủ protein

    🏃‍♂️ **HOẠT ĐỘNG CAO (Thể thao, làm việc):**
    • Tăng 20-40% lượng thức ăn
    • Thức ăn năng lượng cao • Bổ sung đạm

    **📈 THÀNH PHẦN DINH DƯỠNG CHI TIẾT:**

    🍖 **PROTEIN (22-28%):**
    • Thịt gà, cá, bò, cừu • Trứng
    • Đạm chất lượng cao • Dễ tiêu hóa

    🥑 **CHẤT BÉO (10-15%):**
    • Omega-3,6 • Dầu cá • Mỡ gà
    • Giúp da lông khỏe • Năng lượng

    🌾 **CARB (30-50%):**
    • Ngũ cốc • Gạo lứt • Khoai tây
    • Năng lượng • Chất xơ

    🥦 **CHẤT XƠ (2-4%):**
    • Cải bó xôi • Bí đỏ • Cà rốt
    • Hỗ trợ tiêu hóa • Ngừa táo bón

    **💧 NƯỚC UỐNG:**
    • 50-60ml/kg/ngày • Nước sạch luôn có sẵn
    • Thay nước 2-3 lần/ngày

    **Hãy cho tôi biết thêm về chó của bạn để tư vấn chính xác hơn!`;
}

function getDogSeniorNutrition() {
    return `🐩 **DINH DƯỠNG CHÓ GIÀ (7+ TUỔI) - CHI TIẾT** 🐩

    **🩺 ĐIỀU CHỈNH THEO BỆNH LÝ:**

    🧬 **BỆNH THẬN:**
    • Giảm protein • Giảm phospho
    • Tăng chất béo • Kiểm soát natri
    • Thức ăn hạt nhỏ, mềm

    🦴 **VIÊM KHỚP:**
    • Bổ sung glucosamine • Chondroitin
    • Omega-3 chống viêm • Duy trì cân nặng lý tưởng

    ❤️ **BỆNH TIM:**
    • Giảm natri • Tăng omega-3
    • Bổ sung taurine • Kiểm soát cân nặng

    🩸 **TIỂU ĐƯỜNG:**
    • Carb phức hợp • Chất xơ hòa tan
    • Ổn định đường huyết • Chia nhỏ bữa ăn

    **📊 THÀNH PHẦN ĐẶC BIỆT:**

    🍖 **PROTEIN (25-30%):**
    • Chất lượng cao • Dễ tiêu hóa
    • Giảm gánh nặng cho thận

    🥑 **CHẤT BÉO (10-12%):**
    • Giảm so với trưởng thành • Vẫn đủ omega
    • Năng lượng dễ hấp thu

    🥦 **CHẤT XƠ (5-8%):**
    • Tăng so với trẻ • Chống táo bón
    • Hỗ trợ tiêu hóa

    **💊 BỔ SUNG CHỨC NĂNG:**

    🔹 **Glucosamine:** 500-1000mg/ngày
    🔹 **Omega-3:** 100mg/kg cân nặng  
    🔹 **Chất chống oxy hóa:** Vitamin E, C
    🔹 **Probiotic:** Hỗ trợ tiêu hóa

    **Hãy cho tôi biết tình trạng sức khỏe cụ thể của chó!`;
}

// Tương tự cho các hàm mèo trưởng thành và mèo già
function getCatAdultNutrition() {
    return `🐈 **DINH DƯỠNG MÈO TRƯỞNG THÀNH (1-7 TUỔI) - CHI TIẾT** 🐈

    **📊 LƯỢNG THỨC ĂN THEO CÂN NẶNG:**

    ⚖️ **THỨC ĂN KHÔ - THEO CÂN NẶNG:**
    • Mèo 2-3kg: 40-50g/ngày
    • Mèo 3-4kg: 50-60g/ngày  
    • Mèo 4-5kg: 60-70g/ngày
    • Mèo 5-6kg: 70-80g/ngày
    • Mèo 6-7kg: 80-90g/ngày

    🥫 **THỨC ĂN ƯỚT - THEO CÂN NẶNG:**
    • Mèo 2-3kg: 150-200g/ngày
    • Mèo 3-4kg: 200-250g/ngày
    • Mèo 4-5kg: 250-300g/ngày
    • Mèo 5-6kg: 300-350g/ngày

    **🔄 TỶ LỆ THỨC ĂN ƯỚT/KHÔ LÝ TƯỚNG:**

    🍽️ **LỰA CHỌN TỐI ƯU:**
    • 70% thức ăn ướt + 30% thức ăn khô
    • Thức ăn ướt: Cung cấp đủ nước, tốt cho thận
    • Thức ăn khô: Làm sạch răng, tiện lợi

    💧 **CHỈ ĂN KHÔ:**
    • Đảm bảo luôn có đủ nước sạch
    • Nhiều bát nước ở các vị trí
    • Có thể dùng đài phun nước

    🥫 **CHỈ ĂN ƯỚT:**
    • 200-300g/ngày tùy cân nặng
    • Chia 2-3 bữa/ngày
    • Vệ sinh bát ăn thường xuyên

    **📈 THÀNH PHẦN DINH DƯỠNG QUAN TRỌNG:**

    🍖 **ĐẠM ĐỘNG VẬT (Trên 30%):**
    • Mèo là động vật ăn thịt bắt buộc
    • Nguồn đạm chất lượng: Thịt gà, cá, bò
    • Tránh đạm thực vật (khó hấp thu)

    💧 **ĐỘ ẨM THỨC ĂN:**
    • Thức ăn ướt: 70-80% độ ẩm
    • Thức ăn khô: 10-12% độ ẩm
    • Mèo uống ít nước tự nhiên

    🧬 **TAURINE (500-750mg/kg):**
    • BẮT BUỘC cho mèo • Ngừa mù lòa, bệnh tim
    • Có sẵn trong thịt, cá tươi
    • Mất đi khi nấu chín kỹ

    ⚖️ **MAGIE (0.08-0.1%):**
    • Kiểm soát để tránh sỏi tiết niệu
    • Giữ pH nước tiểu 6.0-6.5 (acid nhẹ)

    **🏠 THEO LOẠI MÈO:**

    🐈 **MÈO TRONG NHÀ:**
    • Ít vận động • Giảm 10-20% lượng thức ăn
    • Thức ăn ít calo • Tránh béo phì
    • Tăng cường chơi đùa

    🐈 **MÈO NGOÀI TRỜI:**
    • Hoạt động nhiều • Tăng 10-20% lượng thức ăn
    • Nhu cầu năng lượng cao • Theo dõi cân nặng

    ✂️ **MÈO ĐÃ TRIỆT SẢN:**
    • Giảm 15-25% calo so với bình thường
    • Trao đổi chất chậm hơn • Dễ béo phì
    • Thức ăn cho mèo triệt sản

    **🐾 THEO GIỐNG MÈO:**

    🔸 **MÈO BA TƯ (PERSIAN):**
    • Mặt phẳng, khó ăn • Cần hạt hình chữ V
    • Dễ bị búi lông • Bổ sung dầu, malt paste
    • Chải lông hàng ngày

    🔸 **MÈO XIÊM (SIAMESE):**
    • Năng động • Nhu cầu đạm cao
    • Dễ béo phì nếu ít vận động • Kiểm soát cân nặng

    🔸 **MÈO LÔNG DÀI (MAINE COON, RAGDOLL):**
    • Cần bổ sung dầu • Thức ăn chống búi lông
    • Chải lông thường xuyên • Uống nhiều nước

    🔸 **MÈO TA (DOMESTIC):**
    • Sức đề kháng tốt • Dễ chăm sóc
    • Vẫn cần đủ Taurine và vitamin

    **🍖 THỨC ĂN TỰ NHIÊN BỔ SUNG:**

    ✅ **THỰC PHẨM TỐT:**
    • Thịt gà luộc • Cá hồi/hồi hấp (2-3 lần/tuần)
    • Gan gà (1 lần/tuần) • Lòng đỏ trứng luộc
    • Sữa chua không đường • Bí đỏ nghiền

    ❌ **THỰC PHẨM CẤM:**
    • Hành, tỏi • Socola • Caffein
    • Nho, nho khô • Đồ ngọt • Rượu bia

    **📅 LỊCH ĂN LÝ TƯỞNG:**

    🌅 **BUỔI SÁNG (7-8h):**
    • Thức ăn ướt • 40% tổng lượng ăn
    • Sau khi ăn nên nghỉ ngơi

    🌇 **BUỔI CHIỀU (17-18h):**
    • Thức ăn khô • 30% tổng lượng ăn
    • Có thể để tự do ăn cả đêm

    🌃 **BUỔI TỐI (TÙY CHỌN):**
    • Thức ăn ướt • 30% tổng lượng ăn
    • Hoặc đồ ăn vặt lành mạnh

    **💧 NƯỚC UỐNG - CỰC KỲ QUAN TRỌNG:**

    💦 **LƯỢNG NƯỚC CẦN:**
    • 50-60ml/kg cân nặng/ngày
    • Mèo ăn khô cần nhiều nước hơn

    🚰 **KHUYẾN KHÍCH UỐNG NƯỚC:**
    • Nhiều bát nước ở các vị trí
    • Bát nước rộng, không chạm râu
    • Đài phun nước cho mèo
    • Nước luôn sạch, thay 2 lần/ngày

    **⚠️ DẤU HIỆU DINH DƯỠNG TỐT:**
    • Cân nặng ổn định • Lông bóng mượt
    • Mắt sáng • Năng động • Phân thành khuôn

    **🚨 DẤU HIỆU BẤT THƯỜNG:**
    • Béo phì • Gầy yếu • Lông xơ xác
    • Tiêu chảy/táo bón • Nôn mửa

    **Hãy cho tôi biết:**
    • Cân nặng hiện tại của mèo? • Mèo trong nhà hay ngoài trời?
    • Đã triệt sản chưa? • Đang dùng thức ăn gì?`;
}

function getCatSeniorNutrition() {
    return `🐈⬛ **DINH DƯỠNG MÈO GIÀ (7+ TUỔI) - CHI TIẾT** 🐈⬛

    **🩺 THAY ĐỔI SINH LÝ MÈO GIÀ:**

    👃 **KHỨU GIÁC GIẢM:**
    • Thức ăn có mùi hấp dẫn hơn
    • Làm ấm thức ăn để tăng mùi
    • Thức ăn ướt thơm ngon hơn khô

    🦷 **RĂNG YẾU:**
    • Thức ăn mềm, ướt • Hạt nhỏ, dễ nhai
    • Tránh thức ăn cứng, khó nhai

    🍽️ **TIÊU HÓA KÉM:**
    • Thức ăn dễ tiêu hóa • Nhiều chất xơ
    • Chia nhỏ bữa ăn • Men vi sinh

    💧 **UỐNG ÍT NƯỚC:**
    • Tăng thức ăn ướt • Nhiều bát nước
    • Đài phun nước • Nước luôn sạch

    **🩺 ĐIỀU CHỈNH THEO BỆNH LÝ:**

    🧬 **BỆNH THẬN MÃN:**
    • Protein CHẤT LƯỢNG CAO • Ít phospho
    • Giảm natri • Tăng độ ẩm thức ăn
    • Thức ăn chuyên cho thận

    🩸 **TIỂU ĐƯỜNG:**
    • Low-carb, high-protein • Ổn định đường huyết
    • Chia nhỏ bữa ăn • Tránh đồ ngọt

    🦴 **VIÊM KHỚP:**
    • Bổ sung omega-3 • Glucosamine
    • Duy trì cân nặng lý tưởng • Thức ăn mềm

    ⚖️ **BÉO PHÌ:**
    • Giảm 20-30% calo • Tăng đạm, giảm béo
    • Thức ăn ít calo • Tăng vận động

    **📊 THÀNH PHẦN ĐẶC BIỆT CHO MÈO GIÀ:**

    🍖 **PROTEIN (35-45%):**
    • Chất lượng cao • Dễ tiêu hóa
    • Duy trì khối cơ • Giảm teo cơ

    🥑 **CHẤT BÉO (12-18%):**
    • Giảm so với trẻ • Đủ omega-3,6
    • Năng lượng dễ hấp thu • Giảm gánh gan

    🥦 **CHẤT XƠ (3-5%):**
    • Chống táo bón • Hỗ trợ tiêu hóa
    • Kiểm soát cân nặng

    🧪 **PHOSPHO (Dưới 0.6%):**
    • Bảo vệ thận • Giảm gánh nặng thận
    • Quan trọng với mèo có vấn đề thận

    **💊 BỔ SUNG CHỨC NĂNG:**

    🔹 **Vitamin B complex:** Cho mèo biếng ăn
    🔹 **Omega-3:** 100mg/kg cân nặng - chống viêm
    🔹 **Probiotic:** Hỗ trợ tiêu hóa - hàng ngày
    🔹 **Taurine:** VẪN CẦN 500mg/kg - không giảm
    🔹 **Glucosamine:** 250-500mg/ngày cho khớp

    **🍲 LOẠI THỨC ĂN ĐẶC BIỆT:**

    🥫 **ƯU TIÊN THỨC ĂN ƯỚT:**
    • Độ ẩm cao (>75%) • Dễ nhai, dễ tiêu
    • Mùi hấp dẫn • Tốt cho thận

    🍚 **THỨC ĂN KHÔ ĐẶC BIỆT:**
    • Hạt nhỏ, mềm • Dễ nhai
    • Dành riêng cho mèo già

    🍖 **THỨC ĂN TỰ NHIÊN:**
    • Thịt gà xay nhuyễn • Cá hồi hấp
    • Trứng luộc • Sữa chua

    **📅 LỊCH ĂN CHO MÈO GIÀ:**

    🕖 **BỮA NHỎ THƯỜNG XUYÊN:**
    • 4-6 bữa/ngày • Mỗi bữa ít một
    • Tránh quá tải hệ tiêu hóa
    • Duy trì năng lượng ổn định

    🌅 **SÁNG (7h):** Thức ăn ướt - 20%
    🕛 **TRƯA (12h):** Thức ăn khô - 20%
    🌇 **CHIỀU (17h):** Thức ăn ướt - 30%
    🌃 **TỐI (21h):** Thức ăn ướt - 30%

    **💧 QUẢN LÝ NƯỚC UỐNG:**

    🚰 **KHUYẾN KHÍCH UỐNG NƯỚC:**
    • Nhiều bát nước khắp nhà
    • Bát thủy tinh/inox (sạch sẽ)
    • Nước máy lọc • Thay 2-3 lần/ngày
    • Đài phun nước kích thích uống

    **⚠️ DẤU HIỆU CẦN ĐIỀU CHỈNH:**

    📉 **SUY DINH DƯỠNG:**
    • Sụt cân • Lồi xương sống
    • Lông xơ xác • Yếu ớt

    📈 **THỪA CÂN:**
    • Không sờ thấy xương sườn
    • Bụng xệ • Ít vận động

    🚨 **VẤN ĐỀ SỨC KHỎE:**
    • Tiêu chảy/táo bón • Nôn mửa
    • Uống nhiều tiểu nhiều • Bỏ ăn

    **🎯 LƯU Ý QUAN TRỌNG VỚI MÈO GIÀ:**

    ⚠️ **MÈO BỎ ĂN TRÊN 24H:**
    • Có thể bị lipidosis gan
    • TỬ VONG CAO • Cần bác sĩ ngay

    ⚠️ **THEO DÕI CÂN NẶNG:**
    • Cân mỗi tháng • Ghi chép lại
    • Phát hiện sớm thay đổi

    ⚠️ **KHÁM ĐỊNH KỲ:**
    • 6 tháng/lần • Xét nghiệm máu
    • Phát hiện sớm bệnh tuổi già

    **Hãy cho tôi biết:**
    • Tuổi chính xác của mèo? • Cân nặng hiện tại?
    • Có bệnh lý gì không? • Đang dùng thuốc gì?
    • Mèo có biếng ăn không?`;
}

// === XỬ LÝ CÁC VẤN ĐỀ KHÁC ===
function handleSkinIssues(message) {
    return `🧴 **DA & LÔNG - GỢI Ý TRIỆU CHỨNG:** 🧴
Hãy mô tả cụ thể hơn:
• "Ngứa" - vị trí nào? Bao lâu rồi?
• "Rụng lông" - từng mảng hay toàn thân?
• "Ghẻ" - có lây không? Ngứa nhiều không?
• "Dị ứng" - sau khi ăn gì? Tiếp xúc gì?
• "Bọ chét" - có thấy côn trùng không?

Hoặc nói "chó bị ngứa" / "mèo rụng lông" để được tư vấn chi tiết!`;
}

function handleBehaviorIssues(message) {
    return `😟 **HÀNH VI - GỢI Ý VẤN ĐỀ:** 😟
Hãy cho biết cụ thể:
• "Cắn người" - khi nào? Ai bị cắn?
• "Sủa nhiều" - ban ngày hay đêm? Có nguyên nhân?
• "Cào đồ" - đồ đạc nào bị hư?
• "Đi vệ sinh bậy" - vị trí nào? Bao lâu rồi?
• "Stress" - có thay đổi gì trong nhà?

Nói "chó sủa đêm" hoặc "mèo cào sofa" để được tư vấn!`;
}

function handleBasicCare(message) {
    return `🛁 **CHĂM SÓC - GỢI Ý:** 🛁
Bạn muốn biết về:
• "Tắm" - bao lâu? Sữa tắm loại nào?
• "Đánh răng" - cách tập? Kem đánh răng nào?
• "Cắt móng" - bao lâu? Cách cắt an toàn?
• "Chải lông" - lược nào? Tần suất?

Hỏi "cách tắm cho chó" hoặc "đánh răng cho mèo" để được hướng dẫn chi tiết!`;
}

function handleEmergency(message) {
    return `🚨 **CẤP CỨU - GỢI Ý TRIỆU CHỨNG:** 🚨
Nếu thú cưng có các dấu hiệu sau, CẦN BÁC SĨ NGAY:

**CẤP CỨU TỨC THÌ:**
• "Chảy máu không ngừng" • "Gãy xương" 
• "Co giật" • "Bất tỉnh" • "Khó thở"

**CẤP CỨU TRONG VÀI GIỜ:**
• "Nôn ra máu" • "Tiêu chảy ra máu"
• "Bụng chướng to" • "Tiểu không được"
• "Sốt cao > 40.5°C"

Hãy đưa đến bác sĩ thú y ngay lập tức!`;
}

function handleVaccination(message) {
    return `💉 **TIÊM PHÒNG - GỢI Ý:** 💉
Bạn muốn biết về:
• "Lịch tiêm cho chó con" • "Lịch tiêm cho mèo con"
• "Vaccine nào cần thiết?" • "Giá tiêm bao nhiêu?"
• "Tác dụng phụ" • "Tiêm nhắc lại"

Hỏi "lịch tiêm cho chó 2 tháng" hoặc "vaccine cho mèo" để được tư vấn!`;
}

// Các hàm get chi tiết khác...
function getGeneralFeverAdvice() {
    return `🌡️ **SỐT Ở THÚ CƯNG - THÔNG TIN CHUNG:** 🌡️
Hãy cho biết là "chó bị sốt" hay "mèo bị sốt" để được tư vấn chi tiết hơn!

**DẤU HIỆU CHUNG:**
• Mũi khô nóng • Bỏ ăn • Lờ đờ
• Thở nhanh • Run rẩy

**CẦN LÀM NGAY:**
• Đo nhiệt độ • Cho uống nước
• Để nơi thoáng mát • Liên hệ bác sĩ nếu sốt cao`;
}

function getDogGeneralHealthAdvice() {
    return `🐕 **SỨC KHỎE CHÓ - GỢI Ý TRIỆU CHỨNG:** 🐕
Hãy cho biết cụ thể:
• "Sốt" • "Nôn" • "Tiêu chảy" • "Bỏ ăn"
• "Ho" • "Khó thở" • "Đi tiểu khó"
• "Táo bón" • "Mắt đỏ" • "Tai có mùi"

Ví dụ: "chó bị nôn và tiêu chảy" hoặc "cún bỏ ăn 2 ngày"`;
}

function getCatGeneralHealthAdvice() {
    return `🐈 **SỨC KHỎE MÈO - GỢI Ý TRIỆU CHỨNG:** 🐈
Hãy cho biết cụ thể:
• "Nôn" (đặc biệt nôn búi lông)
• "Tiểu khó" (bệnh cực kỳ nguy hiểm)
• "Bỏ ăn" (mèo nhịn ăn rất nguy hiểm)
• "Búi lông" • "Hắt hơi" • "Chảy nước mắt"

Ví dụ: "mèo bị nôn búi lông" hoặc "mèo đi tiểu nhiều lần"`;
}

function getGeneralHealthAdvice() {
    return `🏥 **SỨC KHỎE THÚ CƯNG - GỢI Ý:** 🏥
Hãy cho biết:
• Loại thú cưng ("chó" hoặc "mèo")
• Triệu chứng cụ thể

**CÁC TRIỆU CHỨNG THƯỜNG GẶP:**
• "Sốt" • "Nôn" • "Tiêu chảy" • "Bỏ ăn"
• "Ho" • "Khó thở" • "Đi tiểu khó"

Ví dụ: "chó bị sốt" hoặc "mèo bỏ ăn"`;
}

// Gamification System
function initGamification() {
    if (state.currentUser) {
        fetch(`/api/users/${state.currentUser.id}`)
        .then(response => response.json())
        .then(user => {
            state.userPoints = user.points || 0;
            state.badges = user.badges || [];
            updateGamificationUI();
        })
        .catch(error => {
            console.error('Error loading user data:', error);
        });
    }
}

function addPoints(points) {
    if (!state.currentUser) return;

    fetch(`/api/users/${state.currentUser.id}/points`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points: points }),
    })
    .then(response => response.json())
    .then(data => {
        state.userPoints += points;
        
        return fetch(`/api/users/${state.currentUser.id}`);
    })
    .then(response => response.json())
    .then(user => {
        state.userPoints = user.points;
        state.badges = user.badges || [];
        
        if (state.currentPage === 'community') {
            updateGamificationUI();
        }
        
        showMessage(`+${points} điểm thưởng!`, 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Lỗi cập nhật điểm!', 'error');
    });
}

function updateGamificationUI() {
    const pointsDisplay = document.getElementById('user-points');
    const badgesGrid = document.getElementById('badges-grid');
    
    if (pointsDisplay) {
        pointsDisplay.textContent = state.userPoints;
    }
    
    if (badgesGrid) {
        const allBadges = [
            { id: 'beginner', name: 'Người mới bắt đầu', icon: '🆕', requirement: 'Đăng ký tài khoản' },
            { id: 'expert', name: 'Chuyên gia thú cưng', icon: '🏆', requirement: 'Đạt 500 điểm' },
            { id: 'pet_lover', name: 'Người yêu thú cưng', icon: '❤️', requirement: 'Thêm thú cưng đầu tiên' }
        ];
        
        badgesGrid.innerHTML = allBadges.map(badge => `
            <div class="badge ${state.badges.includes(badge.id) ? 'earned' : ''}">
                <div class="badge-icon">${badge.icon}</div>
                <h4>${badge.name}</h4>
                <p>${badge.requirement}</p>
                ${state.badges.includes(badge.id) ? 
                    '<small style="color: var(--success);">Đã đạt được</small>' : 
                    '<small style="color: var(--gray);">Chưa đạt</small>'
                }
            </div>
        `).join('');
    }
}

function loadCommunityFeatures() {
    updateGamificationUI();
}

// Utility Functions
function getPetEmoji(type) {
    const emojis = {
        'dog': '🐕',
        'cat': '🐈',
        'bird': '🐦',
        'fish': '🐠',
        'rabbit': '🐰',
        'hamster': '🐹'
    };
    return emojis[type] || '🐾';
}

function loadInitialData() {
    // Không cần tạo admin user nữa vì đã tạo trong database
}

function showMessage(message, type) {
    document.querySelectorAll('.message-toast').forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-toast';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        color: white;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--info)'};
        z-index: 10000;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        font-weight: 600;
        max-width: 350px;
        border-left: 4px solid ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        animation: slideInRight 0.3s ease;
    `;
    
    if (message.includes('<br>') || message.includes('<strong>')) {
        messageDiv.innerHTML = message;
    } else {
        messageDiv.textContent = message;
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 3000);
}

// Modal System
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// Database Health Check
function checkDatabaseHealth() {
    fetch('/api/health')
    .then(response => response.json())
    .then(data => {
        console.log('Database health:', data);
    })
    .catch(error => {
        console.error('Database health check failed:', error);
    });
}

// Food Calculation System
function initFoodCalculation() {
    state.petFoods = [];
}

function loadPetFoods() {
    return fetch('/api/pet-foods')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch pet foods');
            return response.json();
        })
        .then(foods => {
            state.petFoods = foods;
            return foods;
        })
        .catch(error => {
            console.error('Error loading pet foods:', error);
            showMessage('Lỗi tải danh sách thức ăn!', 'error');
            return [];
        });
}

function showFoodCalculation(petId) {
    const pet = state.pets.find(p => p.id == petId);
    if (!pet) return;

    const foodCalculationTab = document.getElementById('food-calculation-tab');
    if (!foodCalculationTab) return;

    foodCalculationTab.innerHTML = `
        <div class="food-calculation-section">
            <div class="calculation-header">
                <h3>🍖 Tính Toán Lượng Thức Ăn</h3>
                <p>Cho ${pet.name} - ${pet.weight}kg - ${pet.age} tuổi</p>
            </div>

            <div class="calculation-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="food-type">Loại Thú Cưng</label>
                        <select id="food-type" class="form-control" onchange="filterFoods()">
                            <option value="">Tất cả</option>
                            <option value="dog" ${pet.type === 'dog' ? 'selected' : ''}>Chó</option>
                            <option value="cat" ${pet.type === 'cat' ? 'selected' : ''}>Mèo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="food-category">Dạng Thức Ăn</label>
                        <select id="food-category" class="form-control" onchange="filterFoods()">
                            <option value="">Tất cả</option>
                            <option value="dry">Hạt khô</option>
                            <option value="wet">Pate ướt</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="food-select">Chọn Thức Ăn</label>
                    <select id="food-select" class="form-control">
                        <option value="">-- Chọn thức ăn --</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="duration-select">Thời Gian Ước Tính</label>
                    <select id="duration-select" class="form-control">
                        <option value="1">1 tháng</option>
                        <option value="3" selected>3 tháng</option>
                        <option value="6">6 tháng</option>
                    </select>
                </div>

                <button class="btn btn-primary" onclick="calculateFoodAmount(${petId})">
                    🧮 Tính Toán Ngay
                </button>
            </div>

            <div id="food-calculation-result" class="calculation-result" style="display: none;">
                <!-- Results will be displayed here -->
            </div>

            <div class="food-products-grid" id="food-products-grid">
                <!-- Product list will be displayed here -->
            </div>
        </div>
    `;

    loadPetFoods().then(foods => {
        renderFoodProducts(foods);
        populateFoodSelect(foods);
    });
}

function filterFoods() {
    const typeFilter = document.getElementById('food-type').value;
    const categoryFilter = document.getElementById('food-category').value;
    
    const filteredFoods = state.petFoods.filter(food => {
        const matchType = !typeFilter || food.pet_type === typeFilter;
        const matchCategory = !categoryFilter || food.type === categoryFilter;
        return matchType && matchCategory;
    });
    
    renderFoodProducts(filteredFoods);
    populateFoodSelect(filteredFoods);
}

function populateFoodSelect(foods) {
    const select = document.getElementById('food-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Chọn thức ăn --</option>';
    
    if (!foods || foods.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- Không có sản phẩm nào --';
        option.disabled = true;
        select.appendChild(option);
        return;
    }
    
    foods.forEach(food => {
        const option = document.createElement('option');
        option.value = food.id;
        option.textContent = `${food.brand} - ${food.name} (${formatPrice(food.price)}/kg)`;
        option.dataset.food = JSON.stringify(food);
        select.appendChild(option);
    });
}

function renderFoodProducts(foods) {
    const container = document.getElementById('food-products-grid');
    if (!container) return;

    if (!foods || foods.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="grid-column: 1 / -1; padding: 40px;">
                <div class="pet-avatar">🍖</div>
                <h3>Chưa có sản phẩm thức ăn</h3>
                <p>Hiện chưa có sản phẩm thức ăn nào trong hệ thống.</p>
                <a href="#marketplace" class="btn btn-primary mt-2">Đến Marketplace</a>
            </div>
        `;
        return;
    }

    container.innerHTML = foods.map(food => {
        // KIỂM TRA ROLE ĐỂ HIỂN THỊ NÚT PHÙ HỢP
        let actionButtons = '';
        if (state.currentUser && state.currentUser.role === 'seller') {
            actionButtons = `
                <button class="btn btn-outline" disabled>
                    🏪 Chỉ dành cho khách hàng
                </button>
            `;
        } else {
            actionButtons = `
                <button class="btn btn-primary" onclick="selectFoodForCalculation(${food.id})">
                    Chọn để Tính Toán
                </button>
                <button class="btn btn-outline btn-small mt-1" onclick="addToCart(${food.id})">
                    Thêm vào Giỏ
                </button>
            `;
        }

        return `
        <div class="product-card">
            <div class="product-badge">${food.pet_type === 'both' ? 'Chó & Mèo' : food.pet_type === 'dog' ? 'Chó' : 'Mèo'}</div>
            <div class="product-image-container">
                <img src="${food.image_url || '/images/products/default-food.png'}" 
                     alt="${food.name}" 
                     class="product-image"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbxlIiBkeT0iLjNlbSI+UHJvZHVjdCBJbWFnZTwvdGV4dD48L3N2Zz4='">
            </div>
            <h3>${food.brand} - ${food.name}</h3>
            <p class="description">${food.description || 'Thức ăn chất lượng cao'}</p>
            <div class="price">${formatPrice(food.price)}/kg</div>
            <div class="product-meta">
                <small>Năng lượng: ${food.kcal_per_kg} kcal/kg</small>
                ${food.life_stage ? `<small>Giai đoạn: ${food.life_stage}</small>` : ''}
            </div>
            ${actionButtons}
        </div>
    `}).join('');
}

function selectFoodForCalculation(foodId) {
    const food = state.petFoods.find(f => f.id == foodId);
    if (!food) return;

    const select = document.getElementById('food-select');
    if (!select) return;
    
    for (let option of select.options) {
        if (option.value == foodId) {
            select.value = foodId;
            break;
        }
    }
    
    const calculationForm = document.querySelector('.calculation-form');
    if (calculationForm) {
        calculationForm.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    }
    
    showMessage(`Đã chọn ${food.brand} - ${food.name} để tính toán!`, 'success');
}

function calculateFoodAmount(petId) {
    const foodId = document.getElementById('food-select').value;
    const durationMonths = document.getElementById('duration-select').value;

    if (!foodId) {
        showMessage('Vui lòng chọn loại thức ăn!', 'error');
        return;
    }

    fetch(`/api/pets/${petId}/calculate-food`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            foodId: parseInt(foodId), 
            durationMonths: parseInt(durationMonths) 
        }),
    })
    .then(response => response.json())
    .then(result => {
        displayFoodCalculationResult(result);
    })
    .catch(error => {
        console.error('Error calculating food:', error);
        showMessage('Lỗi tính toán thức ăn!', 'error');
    });
}

function displayFoodCalculationResult(result) {
    const resultDiv = document.getElementById('food-calculation-result');
    if (!resultDiv) return;
    
    resultDiv.style.display = 'block';
    
    const monthlyKg = (result.results.totalKg / result.results.durationMonths).toFixed(2);
    const dailyGrams = result.calculation.dailyGrams;
    const totalKg = result.results.totalKg.toFixed(2);

    resultDiv.innerHTML = `
        <div class="result-header">
            <h4>📊 Kết Quả Tính Toán Cho ${result.pet.name}</h4>
            <p>Với ${result.food.brand} - ${result.food.name}</p>
        </div>
        
        <div class="simple-result-grid">
            <div class="simple-result-card">
                <div class="simple-result-icon">🍽️</div>
                <div class="simple-result-content">
                    <h5>Lượng ăn mỗi ngày</h5>
                    <div class="simple-result-value">${dailyGrams}g</div>
                    <div class="simple-result-note">Chia làm ${result.recommendations.feedingFrequency}</div>
                </div>
            </div>
            
            <div class="simple-result-card">
                <div class="simple-result-icon">📅</div>
                <div class="simple-result-content">
                    <h5>Mỗi tháng cần</h5>
                    <div class="simple-result-value">${monthlyKg} kg</div>
                    <div class="simple-result-note">Khoảng ${Math.ceil(monthlyKg)} kg</div>
                </div>
            </div>
            
            <div class="simple-result-card highlight">
                <div class="simple-result-icon">📦</div>
                <div class="simple-result-content">
                    <h5>Tổng cho ${result.results.durationMonths} tháng</h5>
                    <div class="simple-result-value">${totalKg} kg</div>
                    <div class="simple-result-note">Khoảng ${Math.ceil(result.results.totalKg)} kg</div>
                </div>
            </div>
            
            <div class="simple-result-card highlight">
                <div class="simple-result-icon">💰</div>
                <div class="simple-result-content">
                    <h5>Chi phí ước tính</h5>
                    <div class="simple-result-value">${formatPrice(result.results.costPerMonth)}/tháng</div>
                    <div class="simple-result-note">Tổng: ${formatPrice(result.results.totalCost)}</div>
                </div>
            </div>
        </div>

        <div class="package-recommendation">
            <h5>🎯 Gợi ý mua hàng</h5>
            <div class="kg-selection">
                <div class="form-group">
                    <label for="kg-input">Số kg bạn muốn mua:</label>
                    <input type="number" id="kg-input" class="form-control" 
                           value="${Math.ceil(result.results.totalKg)}" 
                           min="1" max="100" step="1">
                    <small class="form-text">Tổng cần: ${totalKg} kg (${Math.ceil(result.results.totalKg)} kg làm tròn)</small>
                </div>
                <div class="price-calculation">
                    <p><strong>Thành tiền: <span id="total-price">${formatPrice(result.results.totalCost)}</span></strong></p>
                </div>
            </div>
        </div>
        
        <div class="simple-recommendations">
            <h5>💡 Lời khuyên cho ${result.pet.name}</h5>
            <div class="recommendation-list">
                <div class="recommendation-item">
                    <span class="recommendation-icon">⏰</span>
                    <div>
                        <strong>Cho ăn:</strong> ${result.recommendations.feedingFrequency}
                    </div>
                </div>
                <div class="recommendation-item">
                    <span class="recommendation-icon">💧</span>
                    <div>
                        <strong>Nước uống:</strong> ${result.recommendations.waterRequirement}
                    </div>
                </div>
                <div class="recommendation-item">
                    <span class="recommendation-icon">⚡</span>
                    <div>
                        <strong>Năng lượng cần:</strong> ${result.calculation.der} kcal/ngày
                    </div>
                </div>
            </div>
            <div class="adjustment-note">
                ${result.recommendations.adjustmentNote}
            </div>
        </div>
        
        <div class="result-actions">
            <button class="btn btn-primary" onclick="addToCartFromCalculation(${result.food.id})">
                🛒 Thêm <span id="kg-display">${Math.ceil(result.results.totalKg)}</span> kg Vào Giỏ
            </button>
            <button class="btn btn-outline" onclick="saveCalculationResult(${result.pet.id}, ${result.food.id})">
                💾 Lưu Kết Quả
            </button>
        </div>
    `;

    setupKgInput(result);
}

function setupKgInput(result) {
    const kgInput = document.getElementById('kg-input');
    const kgDisplay = document.getElementById('kg-display');
    const totalPrice = document.getElementById('total-price');
    
    if (kgInput && totalPrice) {
        kgInput.addEventListener('input', function() {
            const kg = parseInt(this.value) || 0;
            const pricePerKg = result.food.price;
            const calculatedPrice = kg * pricePerKg;
            
            if (kgDisplay) {
                kgDisplay.textContent = kg;
            }
            totalPrice.textContent = formatPrice(calculatedPrice);
        });
    }
}

function addToCartFromCalculation(foodId) {
    if (!state.currentUser) {
        showMessage('Vui lòng đăng nhập để thêm vào giỏ hàng!', 'error');
        openModal('login-modal');
        return;
    }

    // KIỂM TRA ROLE - SELLER KHÔNG THỂ THÊM VÀO GIỎ HÀNG
    if (state.currentUser.role === 'seller') {
        showMessage('Tài khoản seller không thể mua hàng!', 'error');
        return;
    }

    const kgInput = document.getElementById('kg-input');
    const kg = kgInput ? parseFloat(kgInput.value) : 0;

    if (!kg || kg <= 0) {
        showMessage('Vui lòng nhập số kg hợp lệ!', 'error');
        return;
    }

    const food = state.petFoods.find(f => f.id == foodId);
    if (!food) {
        if (state.products[foodId]) {
            const product = state.products[foodId];
            addToCartDirect(foodId, kg, {
                productName: `${product.brand} - ${product.name}`,
                productPrice: product.price,
                metadata: {
                    calculationDetails: ``
                }
            });
        } else {
            showMessage('Không tìm thấy thông tin sản phẩm!', 'error');
        }
        return;
    }

    addToCartDirect(foodId, kg, {
        productName: `${food.brand} - ${food.name}`,
        productPrice: food.price,
        metadata: {
            calculationDetails: ``
        }
    });
}

function saveCalculationResult(petId, foodId) {
    if (!state.currentUser) {
        showMessage('Vui lòng đăng nhập để lưu kết quả!', 'error');
        return;
    }
    
    const calculationKey = `shoppet_calculation_${state.currentUser.id}_${petId}`;
    const calculationData = {
        petId: petId,
        foodId: foodId,
        timestamp: new Date().toISOString(),
        duration: document.getElementById('duration-select')?.value || 1
    };
    
    localStorage.setItem(calculationKey, JSON.stringify(calculationData));
    showMessage('Đã lưu kết quả tính toán!', 'success');
}

function formatPrice(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}


// Export functions for HTML onclick
window.addToCart = addToCart;
window.bookService = bookService;
window.logout = logout;
window.loadOrders = loadOrders;
window.viewOrderDetail = viewOrderDetail;
window.updateOrderStatus = updateOrderStatus;
window.cancelOrder = cancelOrder;
window.showCancelOrderModal = showCancelOrderModal;
window.checkout = checkout;
window.rateOrder = rateOrder;
window.formatPrice = formatPrice;
window.openModal = openModal;
window.closeModal = closeModal;
window.selectPet = selectPet;
window.updateCartItem = updateCartItem;
window.removeCartItem = removeCartItem;
window.clearCart = clearCart;
window.selectFoodForCalculation = selectFoodForCalculation;
window.addToCartFromCalculation = addToCartFromCalculation;
window.saveCalculationResult = saveCalculationResult;
window.filterFoods = filterFoods;
window.calculateFoodAmount = calculateFoodAmount;
window.switchOrdersTab = switchOrdersTab;
window.switchPetDetailTab = switchPetDetailTab;
window.showFoodCalculation = showFoodCalculation;
window.currentSlide = currentSlide;
window.nextSlide = nextSlide;

