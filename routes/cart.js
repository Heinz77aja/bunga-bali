/*==================== 
    CART ROUTES
====================*/

const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Middleware to check if customer is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.customerId) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
};

// GET /api/cart - Get customer's cart
router.get('/', isAuthenticated, (req, res) => {
    try {
        const cartItems = db.prepare(`
            SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.customer_id = ?
            ORDER BY c.created_at ASC
        `).all(req.session.customerId);

        res.json({ success: true, data: cartItems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/cart - Add item to cart
router.post('/', isAuthenticated, (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID wajib diisi' });
        }

        // Check if product exists
        const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }

        // Upsert cart item
        db.prepare(`
            INSERT INTO cart_items (customer_id, product_id, quantity) 
            VALUES (?, ?, ?)
            ON CONFLICT(customer_id, product_id) DO UPDATE SET 
            quantity = quantity + excluded.quantity,
            updated_at = CURRENT_TIMESTAMP
        `).run(req.session.customerId, productId, quantity);

        res.json({ success: true, message: 'Produk ditambahkan ke keranjang' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/cart/:productId - Update quantity
router.put('/:productId', isAuthenticated, (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            db.prepare('DELETE FROM cart_items WHERE customer_id = ? AND product_id = ?').run(
                req.session.customerId,
                productId
            );
        } else {
            db.prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ? AND product_id = ?').run(
                quantity,
                req.session.customerId,
                productId
            );
        }

        res.json({ success: true, message: 'Keranjang diperbarui' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/cart/:productId - Remove item
router.delete('/:productId', isAuthenticated, (req, res) => {
    try {
        const { productId } = req.params;

        db.prepare('DELETE FROM cart_items WHERE customer_id = ? AND product_id = ?').run(
            req.session.customerId,
            productId
        );

        res.json({ success: true, message: 'Produk dihapus dari keranjang' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/cart - Clear cart
router.delete('/', isAuthenticated, (req, res) => {
    try {
        db.prepare('DELETE FROM cart_items WHERE customer_id = ?').run(req.session.customerId);
        res.json({ success: true, message: 'Keranjang dikosongkan' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
