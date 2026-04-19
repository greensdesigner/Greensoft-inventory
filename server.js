const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('--- GREENSOFT INITIALIZATION STARTING ---');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Database Pool
let pool = null;

const createPool = () => {
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT || '3306'),
            waitForConnections: true,
            connectionLimit: 5,
            queueLimit: 0,
            connectTimeout: 20000
        };
        console.log('Attempting DB Connection with host:', config.host, 'user:', config.user);
        pool = mysql.createPool(config);
    } catch (err) {
        console.error('Initial Pool Creation Error:', err.message);
    }
};

createPool();

// Diagnostic Route - Check this in your browser!
app.get('/api/db-check', async (req, res) => {
    try {
        if (!pool) {
            createPool();
            if (!pool) throw new Error('Could not create DB pool. Check env variables.');
        }
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        res.json({
            status: 'connected',
            message: 'DATABASE IS REACHABLE!',
            details: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                database: process.env.DB_NAME
            }
        });
    } catch (err) {
        console.error('Diagnostic DB Error:', err.message);
        res.status(500).json({
            status: 'error',
            error: err.message,
            tip: 'Double check your DB_HOST, DB_USER and DB_PASSWORD in Hostinger Environment Variables.'
        });
    }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Register Logic with better error reporting
app.post('/api/auth/register', async (req, res) => {
    try {
        const { businessName, fullName, phoneNumber, email, password } = req.body;
        if (!pool) throw new Error('Database not connected');
        
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Account already exists for this email.' });
        
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (businessName, fullName, phoneNumber, email, password) VALUES (?, ?, ?, ?, ?)',
            [businessName, fullName, phoneNumber, email, hashed]
        );
        res.status(201).json({ success: true, user: { id: result.insertId, email, businessName, name: fullName } });
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).json({ error: 'Database Error: ' + err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!pool) throw new Error('Database not connected');
        
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });
        
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid email or password.' });
        
        res.json({ success: true, user: { id: user.id, email: user.email, businessName: user.businessName, name: user.fullName } });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ error: 'Database Error: ' + err.message });
    }
});

// Production Setup
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
} else {
    // Vite middleware handled by CLI
    app.get('/', (req, res) => res.send('Server Running - Waiting for Vite...'));
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> SERVER READY ON PORT: ${PORT} <<<`);
    
    // Attempt Table Creation
    const migrate = async () => {
        if (!pool) return;
        try {
            const conn = await pool.getConnection();
            await conn.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, businessName VARCHAR(255), fullName VARCHAR(255), phoneNumber VARCHAR(20), email VARCHAR(255) UNIQUE, password VARCHAR(255), logo TEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
            await conn.query(`CREATE TABLE IF NOT EXISTS inventory (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), category VARCHAR(255), sku VARCHAR(255), quantity INT, unit VARCHAR(50), purchasePrice DECIMAL(10,2), sellingPrice DECIMAL(10,2), minStock INT, supplier VARCHAR(255), lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
            await conn.query(`CREATE TABLE IF NOT EXISTS sales (id VARCHAR(255) PRIMARY KEY, invoiceNo VARCHAR(255), customerName VARCHAR(255), date DATETIME, totalAmount DECIMAL(10,2), paidAmount DECIMAL(10,2), paymentMethod VARCHAR(50), status VARCHAR(50), items JSON)`);
            conn.release();
            console.log('--- DATABASE TABLES VERIFIED ---');
        } catch (e) {
            console.error('--- TABLE VERIFICATION FAILED ---', e.message);
        }
    };
    migrate();
});
