/*==================== 
    PRODUCTS API ROUTES
====================*/

const express = require('express');
const router = express.Router();
const { db, getAll, getById, insert, update, delete: deleteRecord, count } = require('../database/db');

// Auth middleware for protected routes
const isAdmin = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized' });
};

// GET /api/products - Get all products
router.get('/', (req, res) => {
    try {
        const { category, subcategory, active_only } = req.query;

        let sql = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (category) {
            sql += ' AND category = ?';
            params.push(category);
        }

        if (subcategory) {
            sql += ' AND subcategory = ?';
            params.push(subcategory);
        }

        if (active_only !== 'false') {
            sql += ' AND is_active = 1';
        }

        sql += ' ORDER BY created_at DESC';

        const products = db.prepare(sql).all(...params);

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/products/bouquets - Get all bouquets
router.get('/bouquets', (req, res) => {
    try {
        const products = db.prepare(`
            SELECT * FROM products 
            WHERE category = 'bouquet' AND is_active = 1 
            ORDER BY created_at DESC
        `).all();

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/products/flowers - Get all individual flowers
router.get('/flowers', (req, res) => {
    try {
        const products = db.prepare(`
            SELECT * FROM products 
            WHERE category = 'flower' AND is_active = 1 
            ORDER BY subcategory, name
        `).all();

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
    try {
        const product = getById('products', req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/products - Create new product (Admin only)
router.post('/', isAdmin, (req, res) => {
    try {
        const { category, subcategory, name, description, price, image_url, badge } = req.body;

        if (!category || !name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Category, name, dan price wajib diisi'
            });
        }

        const id = insert('products', {
            category,
            subcategory: subcategory || null,
            name,
            description: description || null,
            price: parseInt(price),
            image_url: image_url || null,
            badge: badge || null
        });

        const product = getById('products', id);

        res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan',
            data: product
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', isAdmin, (req, res) => {
    try {
        const product = getById('products', req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan'
            });
        }

        const { category, subcategory, name, description, price, image_url, badge, is_active } = req.body;

        const updateData = {};
        if (category !== undefined) updateData.category = category;
        if (subcategory !== undefined) updateData.subcategory = subcategory;
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseInt(price);
        if (image_url !== undefined) updateData.image_url = image_url;
        if (badge !== undefined) updateData.badge = badge;
        if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

        update('products', req.params.id, updateData);

        const updatedProduct = getById('products', req.params.id);

        res.json({
            success: true,
            message: 'Produk berhasil diupdate',
            data: updatedProduct
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', isAdmin, (req, res) => {
    try {
        const product = getById('products', req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan'
            });
        }

        deleteRecord('products', req.params.id);

        res.json({
            success: true,
            message: 'Produk berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
