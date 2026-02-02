/*==================== 
    ADMIN ROUTES
====================*/

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, getById, insert, update, count } = require('../database/db');
const path = require('path');

// Auth middleware
const isAdmin = (req, res, next) => {
    if (req.session && req.session.adminId) {
        res.locals.admin = req.session.admin;
        return next();
    }
    res.redirect('/admin/login');
};

// GET /admin/login - Login page
router.get('/login', (req, res) => {
    if (req.session && req.session.adminId) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', {
        error: null,
        title: 'Login - Bunga Bali Admin'
    });
});

// POST /admin/login - Process login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

        if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
            return res.render('admin/login', {
                error: 'Username atau password salah',
                title: 'Login - Bunga Bali Admin'
            });
        }

        req.session.adminId = admin.id;
        req.session.admin = {
            id: admin.id,
            username: admin.username,
            full_name: admin.full_name
        };

        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('admin/login', {
            error: 'Terjadi kesalahan, coba lagi',
            title: 'Login - Bunga Bali Admin'
        });
    }
});

// GET /admin/logout - Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// GET /admin - Redirect to dashboard
router.get('/', isAdmin, (req, res) => {
    res.redirect('/admin/dashboard');
});

// GET /admin/dashboard - Dashboard
router.get('/dashboard', isAdmin, (req, res) => {
    try {
        // Get statistics
        const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
        const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
        const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get().count;
        const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'delivered'").get().total;

        // Recent orders
        const recentOrders = db.prepare(`
            SELECT * FROM orders 
            ORDER BY created_at DESC 
            LIMIT 5
        `).all();

        res.render('admin/dashboard', {
            title: 'Dashboard - Bunga Bali Admin',
            admin: req.session.admin,
            stats: {
                totalProducts,
                totalOrders,
                pendingOrders,
                totalRevenue
            },
            recentOrders
        });
    } catch (error) {
        res.status(500).send('Error loading dashboard: ' + error.message);
    }
});

// GET /admin/products - Product list
router.get('/products', isAdmin, (req, res) => {
    try {
        const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();

        res.render('admin/products', {
            title: 'Kelola Produk - Bunga Bali Admin',
            admin: req.session.admin,
            products,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        res.status(500).send('Error loading products: ' + error.message);
    }
});

// POST /admin/products - Create product
router.post('/products', isAdmin, (req, res) => {
    try {
        const app = req.app;
        const upload = app.locals.upload;

        upload.single('image')(req, res, (err) => {
            if (err) {
                return res.redirect('/admin/products?error=' + encodeURIComponent(err.message));
            }

            const { category, subcategory, name, description, price, badge, is_active } = req.body;

            let image_url = req.body.image_url || null;
            if (req.file) {
                image_url = '/uploads/' + req.file.filename;
            }

            insert('products', {
                category: category || 'bouquet',
                subcategory: subcategory || null,
                name,
                description: description || null,
                price: parseInt(price) || 0,
                image_url,
                badge: badge || null,
                is_active: is_active ? 1 : 0
            });

            res.redirect('/admin/products?success=Produk berhasil ditambahkan');
        });
    } catch (error) {
        res.redirect('/admin/products?error=' + encodeURIComponent(error.message));
    }
});

// POST /admin/products/:id/update - Update product
router.post('/products/:id/update', isAdmin, (req, res) => {
    try {
        const app = req.app;
        const upload = app.locals.upload;

        upload.single('image')(req, res, (err) => {
            if (err) {
                return res.redirect('/admin/products?error=' + encodeURIComponent(err.message));
            }

            const { category, subcategory, name, description, price, badge, is_active, existing_image } = req.body;

            let image_url = existing_image || null;
            if (req.file) {
                image_url = '/uploads/' + req.file.filename;
            }

            update('products', req.params.id, {
                category: category || 'bouquet',
                subcategory: subcategory || null,
                name,
                description: description || null,
                price: parseInt(price) || 0,
                image_url,
                badge: badge || null,
                is_active: is_active ? 1 : 0
            });

            res.redirect('/admin/products?success=Produk berhasil diupdate');
        });
    } catch (error) {
        res.redirect('/admin/products?error=' + encodeURIComponent(error.message));
    }
});

// POST /admin/products/:id/delete - Delete product
router.post('/products/:id/delete', isAdmin, (req, res) => {
    try {
        db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
        res.redirect('/admin/products?success=Produk berhasil dihapus');
    } catch (error) {
        res.redirect('/admin/products?error=' + encodeURIComponent(error.message));
    }
});

// GET /admin/orders - Order list
router.get('/orders', isAdmin, (req, res) => {
    try {
        const { status } = req.query;

        let sql = 'SELECT * FROM orders';
        const params = [];

        if (status) {
            sql += ' WHERE status = ?';
            params.push(status);
        }

        sql += ' ORDER BY created_at DESC';

        const orders = db.prepare(sql).all(...params);

        // Get items for each order
        const ordersWithItems = orders.map(order => {
            const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
            return { ...order, items };
        });

        res.render('admin/orders', {
            title: 'Kelola Pesanan - Bunga Bali Admin',
            admin: req.session.admin,
            orders: ordersWithItems,
            currentStatus: status || 'all',
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        res.status(500).send('Error loading orders: ' + error.message);
    }
});

// POST /admin/orders/:id/status - Update order status
router.post('/orders/:id/status', isAdmin, (req, res) => {
    try {
        const { status } = req.body;
        update('orders', req.params.id, { status });
        res.redirect('/admin/orders?success=Status pesanan berhasil diupdate');
    } catch (error) {
        res.redirect('/admin/orders?error=' + encodeURIComponent(error.message));
    }
});

// POST /admin/orders/:id/delete - Delete order
router.post('/orders/:id/delete', isAdmin, (req, res) => {
    try {
        db.prepare('DELETE FROM order_items WHERE order_id = ?').run(req.params.id);
        db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
        res.redirect('/admin/orders?success=Pesanan berhasil dihapus');
    } catch (error) {
        res.redirect('/admin/orders?error=' + encodeURIComponent(error.message));
    }
});

module.exports = router;
