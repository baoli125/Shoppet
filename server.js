const express = require('express');
const path = require('path');
const compression = require('compression');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== DATABASE SETUP ====================
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const db = new sqlite3.Database(path.join(dataDir, 'shoppet.db'));

// ==================== DATABASE INITIALIZATION ====================
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.run('PRAGMA foreign_keys = ON');
        console.log('🔄 Đang khởi tạo database...');

        // 📊 BẢNG USERS
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            points INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_active BOOLEAN DEFAULT 1
        )`, (err) => {
            if (err) {
                console.error('❌ Lỗi tạo bảng users:', err);
                reject(err);
                return;
            }
            console.log('✅ Bảng users đã sẵn sàng');
        });

        // 📊 BẢNG PRODUCTS
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image_url TEXT,
            category TEXT NOT NULL,
            type TEXT NOT NULL,
            brand TEXT,
            weight REAL DEFAULT 1.0,
            unit TEXT DEFAULT 'kg',
            in_stock BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng products:', err);
            else console.log('✅ Bảng products đã sẵn sàng');
        });

        // 📊 BẢNG PET_FOODS_METADATA
        db.run(`CREATE TABLE IF NOT EXISTS pet_foods_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            kcal_per_kg REAL NOT NULL,
            protein_percent REAL,
            fat_percent REAL,
            package_sizes TEXT,
            pet_type TEXT,
            life_stage TEXT,
            FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )`, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng pet_foods_metadata:', err);
            else console.log('✅ Bảng pet_foods_metadata đã sẵn sàng');
        });

        // 📊 BẢNG ORDERS
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            seller_id INTEGER,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            shipping_address TEXT,
            phone_number TEXT,
            customer_notes TEXT,
            cancellation_reason TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE SET NULL
        )`, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng orders:', err);
            else console.log('✅ Bảng orders đã sẵn sàng');
        });

        // 📊 BẢNG ORDER_ITEMS
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            product_price REAL NOT NULL,
            quantity_kg REAL NOT NULL,
            total_price REAL NOT NULL,
            image_url TEXT,
            FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )`, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng order_items:', err);
            else console.log('✅ Bảng order_items đã sẵn sàng');
        });

        // 📊 BẢNG PETS
        db.run(`CREATE TABLE IF NOT EXISTS pets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            nickname TEXT,
            type TEXT NOT NULL,
            breed TEXT NOT NULL,
            gender TEXT NOT NULL,
            age INTEGER NOT NULL,
            weight REAL NOT NULL,
            join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )`, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng pets:', err);
            else console.log('✅ Bảng pets đã sẵn sàng');
        });

        // 📊 BẢNG VACCINES
        db.run(`CREATE TABLE IF NOT EXISTS vaccines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT DEFAULT 'completed',
            FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE
        )`, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng vaccines:', err);
            else console.log('✅ Bảng vaccines đã sẵn sàng');
        });

        // 📊 BẢNG CART_ITEMS
        db.run(`CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            product_price REAL NOT NULL,
            product_image TEXT,
            quantity_kg REAL DEFAULT 1.0,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )`, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng cart_items:', err);
            else console.log('✅ Bảng cart_items đã sẵn sàng');
        });

        // 📊 BẢNG USER_BADGES
        db.run(`CREATE TABLE IF NOT EXISTS user_badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            badge_id TEXT NOT NULL,
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(user_id, badge_id)
        )`, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng user_badges:', err);
            else console.log('✅ Bảng user_badges đã sẵn sàng');
        });

        // 🎯 TẠO INDEXES
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
            'CREATE INDEX IF NOT EXISTS idx_products_type ON products(type)',
            'CREATE INDEX IF NOT EXISTS idx_pet_foods_product_id ON pet_foods_metadata(product_id)'
        ];

        let indexCount = 0;
        indexes.forEach((sql) => {
            db.run(sql, (err) => {
                if (err) console.error('❌ Lỗi tạo index:', err);
                indexCount++;
                if (indexCount === indexes.length) {
                    console.log('✅ Tất cả indexes đã sẵn sàng');
                    createDefaultUsers();
                }
            });
        });

        function createDefaultUsers() {
            // 👤 TẠO ADMIN USER
            db.get('SELECT * FROM users WHERE username = ?', ['LazyBeo'], (err, row) => {
                if (err) {
                    console.error('❌ Lỗi kiểm tra admin user:', err);
                    reject(err);
                    return;
                }
                
                if (!row) {
                    const adminPassword = bcrypt.hashSync('iloveyou', 10);
                    db.run(
                        'INSERT INTO users (username, password, email, display_name, role, points) VALUES (?, ?, ?, ?, ?, ?)',
                        ['LazyBeo', adminPassword, 'admin@shoppet.vn', 'Quản trị viên', 'admin', 1000],
                        function(err) {
                            if (err) {
                                console.error('❌ Lỗi tạo admin user:', err);
                                reject(err);
                            } else {
                                console.log('✅ Admin user created successfully');
                                const adminId = this.lastID;
                                
                                const badges = ['beginner', 'expert', 'pet_lover'];
                                let badgeCount = 0;
                                badges.forEach(badge => {
                                    db.run('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [adminId, badge], (err) => {
                                        if (err) console.error('❌ Lỗi thêm badge:', err);
                                        badgeCount++;
                                        if (badgeCount === badges.length) {
                                            console.log('✅ Đã thêm badges cho admin');
                                            createSellerUser();
                                        }
                                    });
                                });
                            }
                        }
                    );
                } else {
                    console.log('✅ Admin user đã tồn tại');
                    createSellerUser();
                }
            });
        }

        function createSellerUser() {
            // 🏪 TẠO SELLER USER
            db.get('SELECT * FROM users WHERE username = ?', ['baoli'], (err, row) => {
                if (err) {
                    console.error('❌ Lỗi kiểm tra seller user:', err);
                    reject(err);
                    return;
                }
                
                if (!row) {
                    const sellerPassword = bcrypt.hashSync('baoli125', 10);
                    db.run(
                        'INSERT INTO users (username, password, email, display_name, role, points) VALUES (?, ?, ?, ?, ?, ?)',
                        ['baoli', sellerPassword, 'seller@shoppet.vn', 'Người bán', 'seller', 500],
                        function(err) {
                            if (err) {
                                console.error('❌ Lỗi tạo seller user:', err);
                                reject(err);
                            } else {
                                console.log('✅ Seller user created successfully');
                                const sellerId = this.lastID;
                                
                                db.run('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [sellerId, 'beginner']);
                                db.run('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [sellerId, 'expert']);
                                
                                addSampleProducts().then(resolve).catch(reject);
                            }
                        }
                    );
                } else {
                    console.log('✅ Seller user đã tồn tại');
                    addSampleProducts().then(resolve).catch(reject);
                }
            });
        }
    });
}

// ==================== SAMPLE DATA ====================
function addSampleProducts() {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
            if (err) {
                console.error('❌ Lỗi kiểm tra số lượng sản phẩm:', err);
                reject(err);
                return;
            }
            
            if (row.count === 0) {
                console.log('🔄 Đang thêm dữ liệu mẫu sản phẩm...');
                
                const sampleProducts = [
                    {
                        name: 'Whiskas',
                        description: 'Thức ăn cho mèo với hương vị cá thu',
                        price: 55000,
                        image_url: '/images/products/Whiskas.png',
                        category: 'food',
                        type: 'food',
                        brand: 'Whiskas',
                        metadata: {
                            kcal_per_kg: 3800,
                            protein_percent: 32,
                            fat_percent: 12,
                            package_sizes: '[1, 3, 5]',
                            pet_type: 'cat',
                            life_stage: 'adult'
                        }
                    },
                    {
                        name: 'Pedigree',
                        description: 'Thức ăn khô cho chó trưởng thành',
                        price: 120000,
                        image_url: '/images/products/Pedigree.png',
                        category: 'food',
                        type: 'food',
                        brand: 'Pedigree',
                        metadata: {
                            kcal_per_kg: 3500,
                            protein_percent: 28,
                            fat_percent: 15,
                            package_sizes: '[1, 3, 5, 8]',
                            pet_type: 'dog',
                            life_stage: 'adult'
                        }
                    },
                    {
                        name: 'Me-O Tuna',
                        description: 'Thức ăn cho mèo với cá ngừ tự nhiên',
                        price: 45000,
                        image_url: '/images/products/Me-O_Tuna.png',
                        category: 'food',
                        type: 'food',
                        brand: 'Me-O',
                        metadata: {
                            kcal_per_kg: 3700,
                            protein_percent: 30,
                            fat_percent: 14,
                            package_sizes: '[1, 2, 4]',
                            pet_type: 'cat',
                            life_stage: 'adult'
                        }
                    }
                ];

                let completed = 0;
                const totalProducts = sampleProducts.length;

                sampleProducts.forEach((product) => {
                    db.run(
                        `INSERT INTO products (name, description, price, image_url, category, type, brand, weight, unit) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [product.name, product.description, product.price, product.image_url, 
                         product.category, product.type, product.brand, 1.0, 'kg'],
                        function(err) {
                            if (err) {
                                console.error('❌ Lỗi thêm sản phẩm:', err);
                            } else {
                                const productId = this.lastID;
                                if (product.metadata) {
                                    db.run(
                                        `INSERT INTO pet_foods_metadata (product_id, kcal_per_kg, protein_percent, fat_percent, package_sizes, pet_type, life_stage) 
                                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                        [
                                            productId,
                                            product.metadata.kcal_per_kg,
                                            product.metadata.protein_percent,
                                            product.metadata.fat_percent,
                                            product.metadata.package_sizes,
                                            product.metadata.pet_type,
                                            product.metadata.life_stage
                                        ],
                                        (err) => {
                                            if (err) {
                                                console.error('❌ Lỗi thêm metadata:', err);
                                            }
                                        }
                                    );
                                }
                            }
                            completed++;
                            if (completed === totalProducts) {
                                console.log('✅ Đã thêm dữ liệu mẫu sản phẩm thành công');
                                resolve();
                            }
                        }
                    );
                });
            } else {
                console.log('✅ Dữ liệu mẫu sản phẩm đã tồn tại');
                resolve();
            }
        });
    });
}

// ==================== FOOD CALCULATION FUNCTION ====================
function calculateFoodAmount(pet, food, durationMonths) {
    let rer;
    if (pet.type === 'dog') {
        rer = 70 * Math.pow(pet.weight, 0.75);
    } else if (pet.type === 'cat') {
        rer = 70 * Math.pow(pet.weight, 0.67);
    } else {
        rer = 70 * Math.pow(pet.weight, 0.75);
    }

    let der;
    const age = pet.age;
    
    if (pet.type === 'dog') {
        if (age < 1) der = rer * 2.5;
        else if (age >= 1 && age <= 7) der = rer * 1.8;
        else der = rer * 1.4;
    } else if (pet.type === 'cat') {
        if (age < 1) der = rer * 2.5;
        else if (age >= 1 && age <= 7) der = rer * 1.4;
        else der = rer * 1.1;
    } else {
        der = rer * 1.6;
    }

    const kcalPerGram = food.kcal_per_kg / 1000;
    const dailyGrams = der / kcalPerGram;
    const totalDays = durationMonths * 30;
    const totalGrams = dailyGrams * totalDays;
    const totalKg = totalGrams / 1000;
    const totalCost = totalKg * food.price;

    return {
        success: true,
        pet: { name: pet.name, type: pet.type, weight: pet.weight, age: pet.age },
        food: food,
        calculation: {
            rer: Math.round(rer),
            der: Math.round(der),
            dailyGrams: Math.round(dailyGrams),
            dailyCalories: Math.round(der)
        },
        results: {
            durationMonths: durationMonths,
            dailyAmount: Math.round(dailyGrams),
            totalAmount: Math.round(totalGrams),
            totalKg: Math.round(totalKg * 100) / 100,
            totalCost: Math.round(totalCost),
            costPerMonth: Math.round(totalCost / durationMonths)
        },
        recommendations: {
            feedingFrequency: age < 1 ? '3-4 lần/ngày' : '2 lần/ngày',
            waterRequirement: Math.round(pet.weight * 50) + ' ml/ngày',
            adjustmentNote: 'Điều chỉnh theo mức độ hoạt động và tình trạng sức khỏe'
        }
    };
}

// ==================== INITIALIZE DATABASE ====================
initializeDatabase().then(() => {
    console.log('✅ Database initialized successfully');
}).catch(err => {
    console.error('❌ Database initialization failed:', err);
});

// ==================== API ROUTES - AUTHENTICATION ====================

// 🔐 ĐĂNG KÝ USER
app.post('/api/register', (req, res) => {
    const { username, password, email, displayName, role = 'user' } = req.body;

    if (!username || !password || !email || !displayName) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
    }

    if (!['user', 'seller'].includes(role)) {
        return res.status(400).json({ error: 'Vai trò không hợp lệ!' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email không hợp lệ!' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự!' });
    }

    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi server!' });
        }
        if (row) {
            if (row.username === username) {
                return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại!' });
            }
            if (row.email === email) {
                return res.status(400).json({ error: 'Email đã được sử dụng!' });
            }
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run(
            'INSERT INTO users (username, password, email, display_name, role) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, email, displayName, role],
            function(err) {
                if (err) {
                    console.error('❌ Database error:', err);
                    return res.status(500).json({ error: 'Lỗi khi tạo tài khoản!' });
                }
                
                db.run('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [this.lastID, 'beginner']);
                
                res.json({ 
                    message: 'Đăng ký thành công! Vui lòng đăng nhập.',
                    userId: this.lastID 
                });
            }
        );
    });
});

// 🔐 ĐĂNG NHẬP
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
    }

    // 🔐 CHECK ADMIN
    if (username === 'LazyBeo' && password === 'iloveyou') {
        const adminUser = {
            id: 1,
            username: 'LazyBeo',
            email: 'admin@shoppet.vn',
            display_name: 'Quản trị viên',
            role: 'admin',
            points: 1000,
            badges: ['beginner', 'expert', 'pet_lover']
        };
        return res.json({ message: 'Đăng nhập admin thành công!', user: adminUser });
    }

    // 🏪 CHECK SELLER
    if (username === 'baoli' && password === 'baoli125') {
        const sellerUser = {
            id: 2,
            username: 'baoli',
            email: 'seller@shoppet.vn',
            display_name: 'Người bán',
            role: 'seller',
            points: 500,
            badges: ['beginner', 'expert']
        };
        return res.json({ message: 'Đăng nhập seller thành công!', user: sellerUser });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi server!' });
        }
        if (!user) {
            return res.status(400).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
        }

        if (bcrypt.compareSync(password, user.password)) {
            db.all('SELECT badge_id FROM user_badges WHERE user_id = ?', [user.id], (err, badges) => {
                if (err) console.error('❌ Error fetching badges:', err);
                
                const { password, ...userWithoutPassword } = user;
                userWithoutPassword.badges = badges.map(b => b.badge_id);
                
                res.json({ message: 'Đăng nhập thành công!', user: userWithoutPassword });
            });
        } else {
            setTimeout(() => {
                res.status(400).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
            }, 1000);
        }
    });
});

// ==================== API ROUTES - USERS ====================

// 👤 LẤY THÔNG TIN USER
app.get('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;

    db.get('SELECT id, username, email, display_name, role, points, created_at FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi khi lấy thông tin user!' });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User không tồn tại!' });
        }
        
        db.all('SELECT badge_id FROM user_badges WHERE user_id = ?', [userId], (err, badges) => {
            if (err) {
                console.error('❌ Error fetching badges:', err);
                user.badges = [];
            } else {
                user.badges = badges.map(b => b.badge_id);
            }
            res.json(user);
        });
    });
});

// 📊 CẬP NHẬT ĐIỂM USER
app.put('/api/users/:userId/points', (req, res) => {
    const userId = req.params.userId;
    const { points } = req.body;

    db.run('UPDATE users SET points = points + ? WHERE id = ?', [points, userId], function(err) {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi khi cập nhật điểm!' });
        }
        
        db.get('SELECT points FROM users WHERE id = ?', [userId], (err, user) => {
            if (!err && user) {
                const totalPoints = user.points + points;
                
                if (totalPoints >= 500) {
                    db.get('SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?', [userId, 'expert'], (err, existingBadge) => {
                        if (!err && !existingBadge) {
                            db.run('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, 'expert']);
                        }
                    });
                }
            }
        });
        
        res.json({ message: `Đã cộng ${points} điểm!` });
    });
});

// ==================== API ROUTES - ORDERS ====================

// 📦 LẤY ĐƠN HÀNG CỦA USER
app.get('/api/orders/user/:userId', (req, res) => {
    const userId = req.params.userId;

    // KIỂM TRA ROLE - SELLER KHÔNG THỂ XEM ĐƠN HÀNG CUSTOMER
    db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi server!' });
        }
        
        if (user && user.role === 'seller') {
            return res.status(403).json({ error: 'Tài khoản seller không thể xem đơn hàng của khách hàng!' });
        }

        const query = `
            SELECT o.*, 
                   u.display_name as seller_name,
                   (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
            FROM orders o
            LEFT JOIN users u ON o.seller_id = u.id
            WHERE o.user_id = ? 
            ORDER BY o.created_at DESC
        `;
        
        db.all(query, [userId], (err, orders) => {
            if (err) {
                console.error('❌ Database error:', err);
                return res.status(500).json({ error: 'Lỗi khi lấy danh sách đơn hàng!' });
            }

            if (!orders || orders.length === 0) {
                return res.json([]);
            }

            const ordersWithItems = orders.map(order => {
                return new Promise((resolve) => {
                    db.all(
                        `SELECT oi.*, p.image_url 
                         FROM order_items oi
                         LEFT JOIN products p ON oi.product_id = p.id
                         WHERE oi.order_id = ?`,
                        [order.id],
                        (err, items) => {
                            if (err) {
                                console.error('❌ Error fetching order items:', err);
                                order.items = [];
                            } else {
                                order.items = items || [];
                            }
                            resolve(order);
                        }
                    );
                });
            });

            Promise.all(ordersWithItems)
                .then(orders => {
                    res.json(orders);
                })
                .catch(error => {
                    console.error('❌ Error fetching order items:', error);
                    res.json(orders.map(order => ({ ...order, items: [] })));
                });
        });
    });
});

// 🏪 LẤY ĐƠN HÀNG CỦA SELLER
app.get('/api/orders/seller/:sellerId', (req, res) => {
    const sellerId = req.params.sellerId;

    // CHỈ CHO PHÉP SELLER XEM ĐƠN HÀNG CỦA MÌNH
    const query = `
        SELECT o.*, 
               u.display_name as customer_name,
               (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.seller_id = ? 
        ORDER BY o.created_at DESC
    `;
    
    db.all(query, [sellerId], (err, orders) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách đơn hàng!' });
        }

        if (!orders || orders.length === 0) {
            return res.json([]);
        }

        const ordersWithItems = orders.map(order => {
            return new Promise((resolve) => {
                db.all(
                    `SELECT oi.*, p.image_url 
                     FROM order_items oi
                     LEFT JOIN products p ON oi.product_id = p.id
                     WHERE oi.order_id = ?`,
                    [order.id],
                    (err, items) => {
                        order.items = items || [];
                        resolve(order);
                    }
                );
            });
        });

        Promise.all(ordersWithItems)
            .then(orders => {
                res.json(orders);
            })
            .catch(error => {
                console.error('❌ Error fetching order items:', error);
                res.json(orders);
            });
    });
});

// ➕ TẠO ĐƠN HÀNG MỚI
app.post('/api/orders', (req, res) => {
    const { userId, items, shippingAddress, phoneNumber, customerNotes, totalAmount } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Thiếu thông tin đơn hàng!' });
    }

    // KIỂM TRA ROLE - SELLER KHÔNG THỂ TẠO ĐƠN HÀNG
    db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi server!' });
        }
        
        if (user && user.role === 'seller') {
            return res.status(403).json({ error: 'Tài khoản seller không thể đặt hàng!' });
        }

        const sellerId = 2; // Seller mặc định

        db.run(
            `INSERT INTO orders (user_id, seller_id, total_amount, shipping_address, phone_number, customer_notes) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, sellerId, totalAmount, shippingAddress, phoneNumber, customerNotes],
            function(err) {
                if (err) {
                    console.error('❌ Database error:', err);
                    return res.status(500).json({ error: 'Lỗi khi tạo đơn hàng!' });
                }

                const orderId = this.lastID;

                let completed = 0;
                const totalItems = items.length;

                items.forEach(item => {
                    db.run(
                        `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity_kg, total_price, image_url) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [orderId, item.productId, item.productName, item.productPrice, item.quantityKg, item.totalPrice, item.productImage],
                        (err) => {
                            if (err) console.error('❌ Error inserting order item:', err);
                            completed++;
                            if (completed === totalItems) {
                                db.run('UPDATE users SET points = points + 100 WHERE id = ?', [userId]);
                                res.json({ 
                                    message: 'Đặt hàng thành công! Đang chờ người bán xác nhận.', 
                                    orderId 
                                });
                            }
                        }
                    );
                });
            }
        );
    });
});

// 🔄 CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
app.put('/api/orders/:orderId/status', (req, res) => {
    const orderId = req.params.orderId;
    const { status, cancellationReason, cancelledBy } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ!' });
    }

    let updateQuery = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status];

    if (status === 'cancelled' && cancellationReason) {
        updateQuery += ', cancellation_reason = ?';
        params.push(cancellationReason);
    }

    updateQuery += ' WHERE id = ?';
    params.push(orderId);

    db.run(updateQuery, params, function(err) {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi khi cập nhật đơn hàng!' });
        }
        
        if (status === 'delivered') {
            db.get('SELECT user_id FROM orders WHERE id = ?', [orderId], (err, order) => {
                if (!err && order) {
                    db.run('UPDATE users SET points = points + 50 WHERE id = ?', [order.user_id]);
                }
            });
        }
        
        const message = getStatusUpdateMessage(status, cancelledBy);
        res.json({ message, status });
    });
});

function getStatusUpdateMessage(status, cancelledBy) {
    const messages = {
        'pending': 'Đơn hàng đang chờ xác nhận',
        'confirmed': 'Đã xác nhận đơn hàng',
        'shipped': 'Đơn hàng đang được giao',
        'delivered': 'Đơn hàng đã giao thành công',
        'cancelled': cancelledBy === 'seller' ? 'Người bán đã hủy đơn hàng' : 'Đã hủy đơn hàng'
    };
    return messages[status] || 'Cập nhật trạng thái thành công';
}

// 📋 LẤY CHI TIẾT ĐƠN HÀNG
app.get('/api/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    db.get(
        `SELECT o.*, 
                seller.display_name as seller_name,
                customer.display_name as customer_name
         FROM orders o
         LEFT JOIN users seller ON o.seller_id = seller.id
         LEFT JOIN users customer ON o.user_id = customer.id
         WHERE o.id = ?`,
        [orderId],
        (err, order) => {
            if (err) {
                console.error('❌ Database error:', err);
                return res.status(500).json({ error: 'Lỗi khi lấy thông tin đơn hàng!' });
            }
            if (!order) {
                return res.status(404).json({ error: 'Đơn hàng không tồn tại!' });
            }

            db.all(
                `SELECT oi.*, p.image_url 
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [orderId],
                (err, items) => {
                    if (err) console.error('❌ Error fetching order items:', err);
                    order.items = items || [];
                    res.json(order);
                }
            );
        }
    );
});

// ==================== API ROUTES - PETS ====================

// 🐾 THÊM THÚ CƯNG MỚI
app.post('/api/pets', (req, res) => {
    const { userId, name, nickname, type, breed, age, weight, gender } = req.body;

    if (!userId || !name || !type || !breed || !age || !weight || !gender) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc!' });
    }

    db.run(
        'INSERT INTO pets (user_id, name, nickname, type, breed, age, weight, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, name, nickname, type, breed, age, weight, gender],
        function(err) {
            if (err) {
                console.error('❌ Database error:', err);
                return res.status(500).json({ error: 'Lỗi khi thêm thú cưng!' });
            }

            const petId = this.lastID;
            
            let defaultVaccines = [];
            
            if (type === 'dog') {
                defaultVaccines = [
                    { name: 'Vaccine dại', date: new Date().toISOString().split('T')[0] },
                    { name: 'Vaccine 5 bệnh', date: new Date().toISOString().split('T')[0] }
                ];
            } else if (type === 'cat') {
                defaultVaccines = [
                    { name: 'Vaccine 4 bệnh', date: new Date().toISOString().split('T')[0] }
                ];
            }

            const vaccinePromises = defaultVaccines.map(vaccine => {
                return new Promise((resolve, reject) => {
                    db.run('INSERT INTO vaccines (pet_id, name, date) VALUES (?, ?, ?)',
                        [petId, vaccine.name, vaccine.date], (err) => err ? reject(err) : resolve());
                });
            });

            Promise.all(vaccinePromises)
                .then(() => {
                    db.run('UPDATE users SET points = points + 50 WHERE id = ?', [userId]);
                    db.get('SELECT COUNT(*) as pet_count FROM pets WHERE user_id = ?', [userId], (err, result) => {
                        if (!err && result.pet_count >= 1) {
                            db.get('SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?', 
                                [userId, 'pet_lover'], (err, existingBadge) => {
                                    if (!err && !existingBadge) {
                                        db.run('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, 'pet_lover']);
                                    }
                                });
                        }
                    });
                    res.json({ message: 'Thêm thú cưng thành công!', petId });
                })
                .catch(vaccineErr => {
                    console.error('❌ Error adding vaccines:', vaccineErr);
                    res.json({ message: 'Thêm thú cưng thành công! (Lỗi khi thêm vaccine)', petId });
                });
        }
    );
});

// 📋 LẤY DANH SÁCH THÚ CƯNG CỦA USER
app.get('/api/pets/:userId', (req, res) => {
    const userId = req.params.userId;

    db.all(
        `SELECT p.*, 
                (SELECT COUNT(*) FROM vaccines v WHERE v.pet_id = p.id) as vaccine_count
         FROM pets p 
         WHERE p.user_id = ? 
         ORDER BY p.join_date DESC`,
        [userId],
        (err, pets) => {
            if (err) {
                console.error('❌ Database error:', err);
                return res.status(500).json({ error: 'Lỗi khi lấy danh sách thú cưng!' });
            }

            if (!pets || pets.length === 0) {
                return res.json([]);
            }

            const petsWithVaccines = pets.map(pet => {
                return new Promise((resolve) => {
                    db.all('SELECT * FROM vaccines WHERE pet_id = ?', [pet.id], (err, vaccines) => {
                        pet.vaccines = vaccines || [];
                        resolve(pet);
                    });
                });
            });

            Promise.all(petsWithVaccines)
                .then(pets => {
                    res.json(pets);
                })
                .catch(error => {
                    console.error('❌ Error fetching vaccines:', error);
                    res.json(pets);
                });
        }
    );
});

// ==================== API ROUTES - CART ====================

// 🛒 THÊM VÀO GIỎ HÀNG
app.post('/api/cart', (req, res) => {
    const { userId, productId, productName, productPrice, productImage, quantityKg = 1.0, metadata = {} } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ error: 'Thiếu thông tin sản phẩm!' });
    }

    // KIỂM TRA ROLE - SELLER KHÔNG THỂ THÊM VÀO GIỎ HÀNG
    db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi server!' });
        }
        
        if (user && user.role === 'seller') {
            return res.status(403).json({ error: 'Tài khoản seller không thể thêm vào giỏ hàng!' });
        }

        db.get('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId], (err, existingItem) => {
            if (err) {
                console.error('❌ Database error:', err);
                return res.status(500).json({ error: 'Lỗi server!' });
            }

            if (existingItem) {
                db.run(
                    'UPDATE cart_items SET quantity_kg = quantity_kg + ?, metadata = ? WHERE user_id = ? AND product_id = ?',
                    [quantityKg, JSON.stringify(metadata), userId, productId],
                    (err) => {
                        if (err) {
                            console.error('❌ Database error:', err);
                            return res.status(500).json({ error: 'Lỗi khi cập nhật giỏ hàng!' });
                        }
                        db.run('UPDATE users SET points = points + 10 WHERE id = ?', [userId]);
                        res.json({ message: 'Đã cập nhật giỏ hàng!' });
                    }
                );
            } else {
                db.run(
                    'INSERT INTO cart_items (user_id, product_id, product_name, product_price, product_image, quantity_kg, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [userId, productId, productName, productPrice, productImage, quantityKg, JSON.stringify(metadata)],
                    function(err) {
                        if (err) {
                            console.error('❌ Database error:', err);
                            return res.status(500).json({ error: 'Lỗi khi thêm vào giỏ hàng!' });
                        }
                        db.run('UPDATE users SET points = points + 10 WHERE id = ?', [userId]);
                        res.json({ message: 'Đã thêm vào giỏ hàng!' });
                    }
                );
            }
        });
    });
});

// 📋 LẤY GIỎ HÀNG CỦA USER
app.get('/api/cart/:userId', (req, res) => {
    const userId = req.params.userId;

    // KIỂM TRA ROLE - SELLER KHÔNG CÓ GIỎ HÀNG
    db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi server!' });
        }
        
        if (user && user.role === 'seller') {
            return res.json([]); // Seller không có giỏ hàng
        }

        db.all(
            `SELECT ci.*, 
                    (ci.product_price * ci.quantity_kg) as total_price
             FROM cart_items ci
             WHERE ci.user_id = ? 
             ORDER BY ci.added_at DESC`,
            [userId],
            (err, items) => {
                if (err) {
                    console.error('❌ Database error:', err);
                    return res.status(500).json({ error: 'Lỗi khi lấy giỏ hàng!' });
                }
                
                const parsedItems = items.map(item => {
                    if (item.metadata) {
                        try { item.metadata = JSON.parse(item.metadata); } 
                        catch (e) { item.metadata = {}; }
                    } else item.metadata = {};
                    return item;
                });
                
                res.json(parsedItems);
            }
        );
    });
});

// 🔄 CẬP NHẬT GIỎ HÀNG
app.put('/api/cart/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const { quantityKg } = req.body;

    if (quantityKg <= 0) {
        db.run('DELETE FROM cart_items WHERE id = ?', [itemId], (err) => {
            if (err) {
                console.error('❌ Database error:', err);
                return res.status(500).json({ error: 'Lỗi khi xóa sản phẩm!' });
            }
            res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng!' });
        });
    } else {
        db.run('UPDATE cart_items SET quantity_kg = ? WHERE id = ?', [quantityKg, itemId], (err) => {
            if (err) {
                console.error('❌ Database error:', err);
                return res.status(500).json({ error: 'Lỗi khi cập nhật giỏ hàng!' });
            }
            res.json({ message: 'Đã cập nhật giỏ hàng!' });
        });
    }
});

// ❌ XÓA ITEM KHỎI GIỎ HÀNG
app.delete('/api/cart/:itemId', (req, res) => {
    const itemId = req.params.itemId;

    db.run('DELETE FROM cart_items WHERE id = ?', [itemId], (err) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi khi xóa sản phẩm!' });
        }
        res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng!' });
    });
});

// 🗑️ XÓA TOÀN BỘ GIỎ HÀNG
app.delete('/api/cart/clear/:userId', (req, res) => {
    const userId = req.params.userId;

    db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], (err) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi khi xóa giỏ hàng!' });
        }
        res.json({ message: 'Đã xóa toàn bộ giỏ hàng!' });
    });
});

// ==================== API ROUTES - PRODUCTS ====================

// 📦 LẤY TẤT CẢ SẢN PHẨM
app.get('/api/products', (req, res) => {
    const { category, type, in_stock } = req.query;
    
    let query = `
        SELECT p.*, 
               pf.kcal_per_kg, 
               pf.protein_percent, 
               pf.fat_percent,
               pf.package_sizes,
               pf.pet_type,
               pf.life_stage
        FROM products p
        LEFT JOIN pet_foods_metadata pf ON p.id = pf.product_id
        WHERE 1=1
    `;
    const params = [];

    if (category) {
        query += ' AND p.category = ?';
        params.push(category);
    }
    if (type) {
        query += ' AND p.type = ?';
        params.push(type);
    }
    if (in_stock !== 'false') {
        query += ' AND p.in_stock = 1';
    }

    query += ' ORDER BY p.created_at DESC';

    db.all(query, params, (err, products) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách sản phẩm!' });
        }
        res.json(products);
    });
});

// 📦 LẤY THÔNG TIN SẢN PHẨM THEO ID
app.get('/api/products/:productId', (req, res) => {
    const productId = req.params.productId;

    const query = `
        SELECT p.*, 
               pf.kcal_per_kg, 
               pf.protein_percent, 
               pf.fat_percent,
               pf.package_sizes,
               pf.pet_type,
               pf.life_stage
        FROM products p
        LEFT JOIN pet_foods_metadata pf ON p.id = pf.product_id
        WHERE p.id = ?
    `;
    
    db.get(query, [productId], (err, product) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi khi lấy thông tin sản phẩm!' });
        }
        if (!product) {
            return res.status(404).json({ error: 'Sản phẩm không tồn tại!' });
        }
        res.json(product);
    });
});

// 🍖 LẤY DANH SÁCH THỨC ĂN
app.get('/api/pet-foods', (req, res) => {
    const { category, type } = req.query;
    
    let query = `
        SELECT p.id, p.name, p.description, p.price, p.image_url, p.brand,
               pf.kcal_per_kg, pf.package_sizes, pf.pet_type, pf.life_stage
        FROM products p
        INNER JOIN pet_foods_metadata pf ON p.id = pf.product_id
        WHERE p.type = 'food' AND p.in_stock = 1
    `;
    const params = [];

    if (category) {
        query += ' AND p.category = ?';
        params.push(category);
    }
    if (type) {
        query += ' AND pf.pet_type = ?';
        params.push(type);
    }

    query += ' ORDER BY p.brand, p.name';

    db.all(query, params, (err, foods) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách thức ăn!' });
        }
        res.json(foods);
    });
});

// ==================== API ROUTES - FOOD CALCULATION ====================

// 🧮 TÍNH TOÁN THỨC ĂN
app.post('/api/pets/:petId/calculate-food', (req, res) => {
    const petId = req.params.petId;
    const { foodId, durationMonths = 1 } = req.body;

    db.get('SELECT * FROM pets WHERE id = ?', [petId], (err, pet) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Lỗi khi lấy thông tin thú cưng!' });
        }
        if (!pet) {
            return res.status(404).json({ error: 'Thú cưng không tồn tại!' });
        }

        const query = `
            SELECT p.*, pf.kcal_per_kg, pf.package_sizes, pf.pet_type, pf.life_stage
            FROM products p
            LEFT JOIN pet_foods_metadata pf ON p.id = pf.product_id
            WHERE p.id = ? AND p.type = 'food'
        `;
        
        db.get(query, [foodId], (err, food) => {
            if (err) {
                console.error('❌ Database error:', err);
                return res.status(500).json({ error: 'Lỗi khi lấy thông tin thức ăn!' });
            }
            if (!food) {
                return res.status(404).json({ error: 'Thức ăn không tồn tại!' });
            }

            const result = calculateFoodAmount(pet, food, durationMonths);
            res.json(result);
        });
    });
});

// ==================== UTILITY ROUTES ====================

// ❤️ HEALTH CHECK
app.get('/api/health', (req, res) => {
    db.get('SELECT 1 as test', (err, row) => {
        if (err) {
            console.error('❌ Database health check failed:', err);
            return res.status(500).json({ 
                status: 'ERROR', 
                message: 'Database connection failed',
                error: err.message 
            });
        }
        res.json({ 
            status: 'OK', 
            message: 'Shoppet is running',
            database: 'Connected',
            timestamp: new Date().toISOString()
        });
    });
});

// ==================== CATCH ALL ROUTE ====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on('SIGINT', () => {
    console.log('\n🔄 Đang đóng database connection...');
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err);
            process.exit(1);
        } else {
            console.log('✅ Database connection closed.');
            process.exit(0);
        }
    });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`\n🚀 Shoppet đang chạy trên http://localhost:${PORT}`);
    console.log(`📊 Database file: ${path.join(dataDir, 'shoppet.db')}`);
    console.log(`⏰ Bắt đầu lúc: ${new Date().toLocaleString('vi-VN')}`);
    console.log('==============================================');
});

