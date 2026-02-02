/*==================== 
    WISHLIST ROUTES
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

// GET /api/wishlist - Get customer's wishlist
router.get('/', isAuthenticated, (req, res) => {
    try {
        const wishlist = db.prepare(`
            SELECT w.id, w.product_id, p.name, p.price, p.image_url, p.badge
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.customer_id = ?
            ORDER BY w.created_at DESC
        `).all(req.session.customerId);

        res.json({ success: true, data: wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/wishlist - Add product to wishlist
router.post('/', isAuthenticated, (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID wajib diisi' });
        }

        // Check if product exists
        const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }

        // Insert or ignore if duplicate
        db.prepare('INSERT OR IGNORE INTO wishlist (customer_id, product_id) VALUES (?, ?)').run(
            req.session.customerId,
            productId
        );

        res.json({ success: true, message: 'Produk ditambahkan ke wishlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/wishlist/:productId - Remove from wishlist
router.delete('/:productId', isAuthenticated, (req, res) => {
    try {
        const { productId } = req.params;

        db.prepare('DELETE FROM wishlist WHERE customer_id = ? AND product_id = ?').run(
            req.session.customerId,
            productId
        );

        res.json({ success: true, message: 'Produk dihapus dari wishlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
