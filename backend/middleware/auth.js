const db = require('../config/database');

// Middleware untuk validasi API Key
async function validateApiKey(req, res, next) {
    try {
        // Ambil API Key dari header
        const apiKey = req.headers['x-api-key'];

        // Cek apakah API Key ada
        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'API Key diperlukan. Sertakan x-api-key di header request.'
            });
        }
        // Validasi API Key di database
        const [rows] = await db.query(
            `SELECT ak.*, u.id as user_id, u.name, u.email, u.role 
             FROM api_keys ak 
             JOIN users u ON ak.user_id = u.id 
             WHERE ak.api_key = ? AND ak.is_active = TRUE`,
            [apiKey]
        );

        // Cek apakah API Key valid
        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'API Key tidak valid atau sudah tidak aktif.'
            });
        }
