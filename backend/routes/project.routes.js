const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateApiKey } = require('../middleware/auth');

// Semua route memerlukan API Key
router.use(validateApiKey);

// GET /api/projects - Get semua projects user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

        const [projects] = await db.query(
            'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error('Error getting projects:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data projects.'
        });
    }
});

// GET /api/projects/:id - Get detail project
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [projects] = await db.query(
            'SELECT * FROM projects WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project tidak ditemukan.'
            });
        }

        res.json({
            success: true,
            data: projects[0]
        });
    } catch (error) {
        console.error('Error getting project detail:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil detail project.'
        });
    }
});

// POST /api/projects - Create project baru
router.post('/', async (req, res) => {
    try {
        const { title, description, budget } = req.body;
        const userId = req.user.id;

        // Validasi input
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Judul project harus diisi.'
            });
        }

        const [result] = await db.query(
            'INSERT INTO projects (user_id, title, description, budget) VALUES (?, ?, ?, ?)',
            [userId, title, description || null, budget || null]
        );

        res.status(201).json({
            success: true,
            message: 'Project berhasil dibuat.',
            data: {
                id: result.insertId,
                title,
                description,
                budget
            }
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat membuat project.'
        });
    }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, budget } = req.body;
        const userId = req.user.id;

        // Cek apakah project milik user
        const [projects] = await db.query(
            'SELECT id FROM projects WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project tidak ditemukan.'
            });
        }

        await db.query(
            'UPDATE projects SET title = ?, description = ?, status = ?, budget = ? WHERE id = ?',
            [title, description, status, budget, id]
        );

        res.json({
            success: true,
            message: 'Project berhasil diupdate.'
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat update project.'
        });
    }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Cek apakah project milik user
        const [projects] = await db.query(
            'SELECT id FROM projects WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project tidak ditemukan.'
            });
        }

        await db.query('DELETE FROM projects WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Project berhasil dihapus.'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus project.'
        });
    }
});

module.exports = router;
