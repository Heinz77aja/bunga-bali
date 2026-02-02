/*==================== 
    BUNGA BALI - BACKEND SERVER
    Node.js + Express
====================*/

const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'bunga-bali-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Hanya file gambar yang diizinkan!'));
    }
});

// Make upload available to routes
app.locals.upload = upload;

// Initialize database
const db = require('./database/db');

// Import routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');
const customerRoutes = require('./routes/customer');

// Login page route
app.get('/login', (req, res) => {
    if (req.session && req.session.customer) {
        return res.redirect('/');
    }
    res.render('auth/login');
});

// Use routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/customer', customerRoutes);

// Root route - serve the main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Bunga Bali API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: err.message || 'Terjadi kesalahan server'
    });
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: 'Endpoint tidak ditemukan'
        });
    }
    res.status(404).send('Halaman tidak ditemukan');
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🌺 ════════════════════════════════════════════ 🌺');
    console.log('');
    console.log('   BUNGA BALI - Toko Bunga Premium');
    console.log('   Server berhasil dijalankan!');
    console.log('');
    console.log(`   🌐 Website:     http://localhost:${PORT}`);
    console.log(`   🔧 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`   📡 API:         http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('   📍 Melayani seluruh wilayah Bali');
    console.log('');
    console.log('🌺 ════════════════════════════════════════════ 🌺');
    console.log('');
});

module.exports = app;
