const db = require('../config/database');

// Create Order
const createOrder = async (req, res) => {
    try {
        const { service_id } = req.body;
        const userId = req.user.id;

        // Validasi input
        if (!service_id) {
            return res.status(400).json({
                success: false,
                message: 'Service ID harus diisi'
            });
        }

        // Cek apakah service ada
        const [services] = await db.query(
            'SELECT * FROM services WHERE service_id = ?',
            [service_id]
        );

        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Layanan tidak ditemukan'
            });
        }

        // Insert order baru
        const [result] = await db.query(
            'INSERT INTO orders (user_id, service_id, status) VALUES (?, ?, ?)',
            [userId, service_id, 'pending']
        );

        res.status(201).json({
            success: true,
            message: 'Pesanan berhasil dibuat',
            data: {
                order_id: result.insertId,
                user_id: userId,
                service_id: service_id,
                service_name: services[0].service_name,
                price: services[0].price,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Error in createOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat membuat pesanan'
        });
    }
};
