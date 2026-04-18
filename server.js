const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function startServer() {
    console.log('--- GREENSOFT SYSTEM BOOTING ---');
    console.log('Time:', new Date().toISOString());

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(express.json());

    // Database Pool Initialization
    let pool;
    try {
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
        console.log('Database Pool: Ready');
    } catch (err) {
        console.error('Database Pool: FAILED', err.message);
    }

    // --- API Routes ---
    
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', uptime: process.uptime() });
    });

    app.get('/api/db-check', async (req, res) => {
        try {
            if (!pool) throw new Error('DB Pool not initialized');
            const conn = await pool.getConnection();
            await conn.ping();
            conn.release();
            res.json({ status: 'connected', message: 'DB connection successful' });
        } catch (err) {
            res.status(500).json({ status: 'error', message: err.message });
        }
    });

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

    // --- Environment Specific Serving ---

    if (process.env.NODE_ENV !== 'production') {
        console.log('Mode: Development (Vite Middleware)');
        // Dynamic import for Vite in CJS environment
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        console.log('Mode: Production (Static Serving)');
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    // --- Start Listening ---
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`>>> SERVER IS ACTIVE ON PORT: ${PORT} <<<`);
        
        // Async Table Check
        const initDB = async () => {
            try {
                const conn = await pool.getConnection();
                await conn.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, businessName VARCHAR(255), fullName VARCHAR(255), phoneNumber VARCHAR(20), email VARCHAR(255) UNIQUE, password VARCHAR(255), logo TEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
                await conn.query(`CREATE TABLE IF NOT EXISTS inventory (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), category VARCHAR(255), sku VARCHAR(255), quantity INT, unit VARCHAR(50), purchasePrice DECIMAL(10,2), sellingPrice DECIMAL(10,2), minStock INT, supplier VARCHAR(255), lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
                await conn.query(`CREATE TABLE IF NOT EXISTS sales (id VARCHAR(255) PRIMARY KEY, invoiceNo VARCHAR(255), customerName VARCHAR(255), date DATETIME, totalAmount DECIMAL(10,2), paidAmount DECIMAL(10,2), paymentMethod VARCHAR(50), status VARCHAR(50), items JSON)`);
                conn.release();
                console.log('Database Tables: Verified OK');
            } catch (e) {
                console.error('Database Tables: Verification Failed', e.message);
            }
        };
        if (pool) initDB();
    });
}

startServer().catch(err => {
    console.error('CRITICAL: Server Failed to Start!', err);
});
