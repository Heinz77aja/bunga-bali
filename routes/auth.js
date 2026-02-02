/*==================== 
    AUTH ROUTES
====================*/

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, getById, insert } = require('../database/db');

// Auth API Routes
router.post('/register', (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama, email, dan password wajib diisi'
            });
        }

        // Check if email already exists
        const existingUser = db.prepare('SELECT id FROM customers WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar'
            });
        }

        // Hash password
        const passwordHash = bcrypt.hashSync(password, 10);

        // Insert new customer
        const customerId = insert('customers', {
            name,
            email,
            password_hash: passwordHash,
            phone: phone || null,
            address: address || null
        });

        // Set session
        req.session.customerId = customerId;
        req.session.customer = {
            id: customerId,
            name,
            email
        };

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: req.session.customer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi'
            });
        }

        const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email);

        if (!customer || !bcrypt.compareSync(password, customer.password_hash)) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        // Set session
        req.session.customerId = customer.id;
        req.session.customer = {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address
        };

        res.json({
            success: true,
            message: 'Login berhasil',
            data: req.session.customer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logout berhasil' });
});

// GET /api/auth/me - Get current user info
router.get('/me', (req, res) => {
    if (req.session && req.session.customer) {
        res.json({
            success: true,
            data: req.session.customer
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Belum login'
        });
    }
});

module.exports = router;
