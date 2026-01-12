const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS untuk frontend
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));
// Import routes
const authRoutes = require('./routes/auth.routes');
const apikeyRoutes = require('./routes/apikey.routes');
const serviceRoutes = require('./routes/service.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');

// Test database connection
require('./config/database');
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FeSpace REST API Server',
        version: '2.0.0',
        author: 'FeSpace Studio Team',
        endpoints: {
            auth: '/api/auth',
            apikey: '/api/apikey',
            services: '/api/services (Client with API Key)',
            servicesAdmin: '/api/services/admin (Admin)',
            orders: '/api/orders (Client with API Key)',
            admin: '/api/admin (Admin)'
        }
    });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/apikey', apikeyRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan.'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 FeSpace REST API Server');
    console.log('='.repeat(50));
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`👤 Author: Sekar Asri Maghfirah - 20230140128`);
    console.log(`📚 Mata Kuliah: Pengembangan Web Service`);
    console.log('='.repeat(50));
});
