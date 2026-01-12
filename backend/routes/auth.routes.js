const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
// POST /api/auth/register - Registrasi user baru
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validasi input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama, email, dan password harus diisi.'
            });
        }

        // Cek apakah email sudah terdaftar
        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user baru
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'client']
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil.',
            data: {
                id: result.insertId,
                name,
                email,
                role: role || 'client'
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat registrasi.'
        });
    }
});
// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password harus diisi.'
            });
        }

        // Cari user berdasarkan email
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah.'
            });
        }

        const user = users[0];

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah.'
            });
        }

        res.json({
            success: true,
            message: 'Login berhasil.',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat login.'
        });
    }
});

module.exports = router;
