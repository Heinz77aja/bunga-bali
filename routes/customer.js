/*==================== 
    CUSTOMER ROUTES
====================*/

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, update } = require('../database/db');

// Middleware to check if customer is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.customerId) {
        return next();
    }
    if (req.xhr || req.path.startsWith('/api/')) {
        return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }
    res.redirect('/#login');
};

// GET /customer/profile - Profile page
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('customer/profile');
});

// GET /api/customer/profile - Get profile data
router.get('/api/profile', isAuthenticated, (req, res) => {
    try {
        const customer = db.prepare('SELECT id, name, email, phone, address, created_at FROM customers WHERE id = ?').get(req.session.customerId);
        res.json({ success: true, data: customer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/customer/profile - Update profile
router.put('/api/profile', isAuthenticated, (req, res) => {
    try {
        const { name, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Nama wajib diisi' });
        }

        update('customers', req.session.customerId, { name, phone, address });

        // Update session data
        req.session.customer.name = name;
        req.session.customer.phone = phone;
        req.session.customer.address = address;

        res.json({ success: true, message: 'Profil berhasil diperbarui', data: req.session.customer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/customer/password - Change password
router.put('/api/password', isAuthenticated, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi' });
        }

        const customer = db.prepare('SELECT password_hash FROM customers WHERE id = ?').get(req.session.customerId);

        if (!bcrypt.compareSync(currentPassword, customer.password_hash)) {
            return res.status(401).json({ success: false, message: 'Password lama salah' });
        }

        const newHash = bcrypt.hashSync(newPassword, 10);
        db.prepare('UPDATE customers SET password_hash = ? WHERE id = ?').run(newHash, req.session.customerId);

        res.json({ success: true, message: 'Password berhasil diubah' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
