const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateApiKey } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ============================================
// IMAGE UPLOAD ROUTE (Admin only)
// ============================================

// Upload image for service
router.post('/admin/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file uploaded.'
            });
        }

        // Return the file path
        const imageUrl = `/uploads/services/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Image uploaded successfully.',
            data: {
                imageUrl: imageUrl,
                filename: req.file.filename
            }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image.'
        });
    }
});

// ============================================
// ADMIN ROUTES (tanpa API Key, pakai session)
// ============================================

// CREATE Service (Admin only)
router.post('/admin', async (req, res) => {
    try {
        const { name, description, price, category, image_url } = req.body;

        // Validasi input
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Nama dan harga layanan harus diisi.'
            });
        }

        const [result] = await db.query(
            'INSERT INTO services (name, description, price, category, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, category || null, image_url || null, true]
        );

        res.status(201).json({
            success: true,
            message: 'Layanan berhasil ditambahkan.',
            data: {
                id: result.insertId,
                name,
                price
            }
        });
    } catch (error) {
        console.error('❌ Error creating service:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menambahkan layanan: ' + error.message
        });
    }
});

// GET All Services (Admin view)
router.get('/admin', async (req, res) => {
    try {
        const [services] = await db.query(
            'SELECT * FROM services ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data layanan.'
        });
    }
});

// UPDATE Service (Admin only)
router.put('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, image_url, is_active } = req.body;

        const [result] = await db.query(
            'UPDATE services SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_active = ? WHERE id = ?',
            [name, description, price, category, image_url, is_active, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Layanan tidak ditemukan.'
            });
        }

        res.json({
            success: true,
            message: 'Layanan berhasil diupdate.'
        });
    } catch (error) {
        console.error('❌ Error updating service:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat update layanan: ' + error.message
        });
    }
});

// DELETE Service (Admin only)
router.delete('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Layanan tidak ditemukan.'
            });
        }

        res.json({
            success: true,
            message: 'Layanan berhasil dihapus.'
        });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus layanan.'
        });
    }
});

// ============================================
// CLIENT ROUTES (dengan API Key)
// ============================================

// GET All Active Services (Client view)
router.get('/', validateApiKey, async (req, res) => {
    try {
        const [services] = await db.query(
            'SELECT id, name, description, price, category, image_url FROM services WHERE is_active = TRUE ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data layanan.'
        });
    }
});

// GET Service Detail (Client view)
router.get('/:id', validateApiKey, async (req, res) => {
    try {
        const { id } = req.params;

        const [services] = await db.query(
            'SELECT id, name, description, price, category, image_url FROM services WHERE id = ? AND is_active = TRUE',
            [id]
        );

        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Layanan tidak ditemukan.'
            });
        }

        res.json({
            success: true,
            data: services[0]
        });
    } catch (error) {
        console.error('Error getting service detail:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil detail layanan.'
        });
    }
});

module.exports = router;
