const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateApiKey } = require('../middleware/auth');

// Semua route memerlukan API Key
router.use(validateApiKey);

// GET /api/tasks/:project_id - Get semua tasks dalam project
router.get('/:project_id', async (req, res) => {
    try {
        const { project_id } = req.params;
        const userId = req.user.id;

        // Cek apakah project milik user
        const [projects] = await db.query(
            'SELECT id FROM projects WHERE id = ? AND user_id = ?',
            [project_id, userId]
        );

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project tidak ditemukan.'
            });
        }

        const [tasks] = await db.query(
            'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC',
            [project_id]
        );

        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error('Error getting tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data tasks.'
        });
    }
});

// POST /api/tasks - Create task baru
router.post('/', async (req, res) => {
    try {
        const { project_id, title, description, priority } = req.body;
        const userId = req.user.id;

        // Validasi input
        if (!project_id || !title) {
            return res.status(400).json({
                success: false,
                message: 'Project ID dan judul task harus diisi.'
            });
        }

        // Cek apakah project milik user
        const [projects] = await db.query(
            'SELECT id FROM projects WHERE id = ? AND user_id = ?',
            [project_id, userId]
        );

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project tidak ditemukan.'
            });
        }

        const [result] = await db.query(
            'INSERT INTO tasks (project_id, title, description, priority) VALUES (?, ?, ?, ?)',
            [project_id, title, description || null, priority || 'medium']
        );

        res.status(201).json({
            success: true,
            message: 'Task berhasil dibuat.',
            data: {
                id: result.insertId,
                project_id,
                title,
                description,
                priority
            }
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat membuat task.'
        });
    }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority } = req.body;
        const userId = req.user.id;

        // Cek apakah task ada dan milik user
        const [tasks] = await db.query(
            `SELECT t.id FROM tasks t 
             JOIN projects p ON t.project_id = p.id 
             WHERE t.id = ? AND p.user_id = ?`,
            [id, userId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task tidak ditemukan.'
            });
        }

        await db.query(
            'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ? WHERE id = ?',
            [title, description, status, priority, id]
        );

        res.json({
            success: true,
            message: 'Task berhasil diupdate.'
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat update task.'
        });
    }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Cek apakah task ada dan milik user
        const [tasks] = await db.query(
            `SELECT t.id FROM tasks t 
             JOIN projects p ON t.project_id = p.id 
             WHERE t.id = ? AND p.user_id = ?`,
            [id, userId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task tidak ditemukan.'
            });
        }

        await db.query('DELETE FROM tasks WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Task berhasil dihapus.'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus task.'
        });
    }
});

module.exports = router;
