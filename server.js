const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Critical Start Logs
console.log('--- SYSTEM INITIALIZING ---');
console.log('Date:', new Date().toISOString());
console.log('Environment:', process.env.NODE_ENV || 'development');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Database Pool
let pool;
async function connectDB() {
    try {
        console.log('Attempting to create DB pool...');
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT || '3306'),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 20000
        });
        console.log('DB Pool Created Successfully');
    } catch (err) {
        console.error('CRITICAL: DB Pool Creation Failed!', err.message);
    }
}

connectDB();

// Health check to verify server is reachable
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'GreenSoft Server is Active' });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { businessName, fullName, phoneNumber, email, password } = req.body;
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'User already exists' });
        
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (businessName, fullName, phoneNumber, email, password) VALUES (?, ?, ?, ?, ?)',
            [businessName, fullName, phoneNumber, email, hashed]
        );
        res.status(201).json({ success: true, user: { id: result.insertId, email, businessName, name: fullName } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });
        
        res.json({ success: true, user: { id: user.id, email: user.email, businessName: user.businessName, name: user.fullName } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Inventory APIs
app.get('/api/inventory', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM inventory');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/inventory', async (req, res) => {
    try {
        const item = req.body;
        await pool.query(
            'INSERT INTO inventory (id, name, category, sku, quantity, unit, purchasePrice, sellingPrice, minStock, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [item.id, item.name, item.category, item.sku, item.quantity, item.unit, item.purchasePrice, item.sellingPrice, item.minStock, item.supplier]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Static Production Serving
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    // Vite middleware will be handled by the runner in dev mode
    app.get('/', (req, res) => res.send('Server Running - Waiting for Vite...'));
}

// Start Listening
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> SERVER READY ON PORT: ${PORT} <<<`);
    console.log('Logs are working. If you see this in Hostinger, the server is UP.');
});

// Periodic Ping to keep logs active
setInterval(() => {
    console.log('App Heartbeat:', new Date().toLocaleTimeString());
}, 60000);
