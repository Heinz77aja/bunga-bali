const express = require('express');
const router = express.Router();
const { db, getById, insert, update, generateOrderNumber } = require('../database/db');

// Auth middleware (check if logged in, but optional for creating order)
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.customer) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
};

// Auth middleware for admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized' });
};

// POST /api/orders - Create new order (Public or Auth)
router.post('/', (req, res) => {
    try {
        const { customer_name, customer_phone, customer_address, customer_notes, items, payment_method } = req.body;

        // Get customer ID from session if logged in
        const customerId = req.session.customer ? req.session.customer.id : null;

        // Validation
        if (!customer_name || !customer_phone) {
            return res.status(400).json({
                success: false,
                message: 'Nama dan nomor telepon wajib diisi'
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Minimal satu produk harus dipilih'
            });
        }

        // Calculate total and validate products
        let totalAmount = 0;
        const validatedItems = [];

        for (const item of items) {
            const product = getById('products', item.product_id);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Produk dengan ID ${item.product_id} tidak ditemukan`
                });
            }

            const quantity = parseInt(item.quantity) || 1;
            const itemTotal = product.price * quantity;
            totalAmount += itemTotal;

            validatedItems.push({
                product_id: product.id,
                product_name: product.name,
                quantity: quantity,
                price: product.price
            });
        }

        // Create order
        const orderNumber = generateOrderNumber();

        const orderId = insert('orders', {
            order_number: orderNumber,
            customer_id: customerId, // Add customer_id (can be null)
            customer_name,
            customer_phone,
            customer_address: customer_address || null,
            customer_notes: customer_notes || null,
            total_amount: totalAmount,
            payment_method: payment_method || 'cod',
            status: 'pending'
        });

        // Create order items
        const insertItem = db.prepare(`
            INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of validatedItems) {
            insertItem.run(orderId, item.product_id, item.product_name, item.quantity, item.price);
        }

        // Get complete order
        const order = getById('orders', orderId);
        const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

        res.status(201).json({
            success: true,
            message: 'Pesanan berhasil dibuat! Kami akan menghubungi Anda segera.',
            data: {
                ...order,
                items: orderItems
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/orders/my-orders - Get logged in user's orders
router.get('/my-orders', isAuthenticated, (req, res) => {
    try {
        const customerId = req.session.customer.id;

        const orders = db.prepare(`
            SELECT * FROM orders 
            WHERE customer_id = ? 
            ORDER BY created_at DESC
        `).all(customerId);

        // Get items for each order
        const ordersWithItems = orders.map(order => {
            const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
            return { ...order, items };
        });

        res.json({
            success: true,
            count: orders.length,
            data: ordersWithItems
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/orders - Get all orders (Admin only)
router.get('/', isAdmin, (req, res) => {
    try {
        const { status, limit } = req.query;

        let sql = 'SELECT * FROM orders WHERE 1=1';
        const params = [];

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        sql += ' ORDER BY created_at DESC';

        if (limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        const orders = db.prepare(sql).all(...params);

        // Get items for each order
        const ordersWithItems = orders.map(order => {
            const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
            return { ...order, items };
        });

        res.json({
            success: true,
            count: orders.length,
            data: ordersWithItems
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/orders/stats - Get order statistics (Admin only)
router.get('/stats', isAdmin, (req, res) => {
    try {
        const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
        const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get().count;
        const completedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'").get().count;
        const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'delivered'").get().total;

        // Today's orders
        const today = new Date().toISOString().slice(0, 10);
        const todayOrders = db.prepare(`
            SELECT COUNT(*) as count FROM orders 
            WHERE DATE(created_at) = ?
        `).get(today).count;

        res.json({
            success: true,
            data: {
                total_orders: totalOrders,
                pending_orders: pendingOrders,
                completed_orders: completedOrders,
                today_orders: todayOrders,
                total_revenue: totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/orders/:id - Get single order (Admin only)
router.get('/:id', isAdmin, (req, res) => {
    try {
        const order = getById('orders', req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan'
            });
        }

        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

        res.json({
            success: true,
            data: {
                ...order,
                items
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/orders/:id/status - Update order status (Admin only)
router.put('/:id/status', isAdmin, (req, res) => {
    try {
        const order = getById('orders', req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan'
            });
        }

        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status tidak valid'
            });
        }

        update('orders', req.params.id, { status });

        const updatedOrder = getById('orders', req.params.id);

        res.json({
            success: true,
            message: 'Status pesanan berhasil diupdate',
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/orders/:id - Delete order (Admin only)
router.delete('/:id', isAdmin, (req, res) => {
    try {
        const order = getById('orders', req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan'
            });
        }

        // Delete order items first (cascade should handle this, but just in case)
        db.prepare('DELETE FROM order_items WHERE order_id = ?').run(req.params.id);
        db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);

        res.json({
            success: true,
            message: 'Pesanan berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
