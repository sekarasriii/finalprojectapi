const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/database');

// Fungsi untuk generate API Key unik
function generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
}

